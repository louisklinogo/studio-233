import { z } from "zod";
import type {
	PluginConfig,
	PluginConfigField,
	ValidationResult,
} from "./plugins/types";

/**
 * Creates a Zod schema from plugin config fields for runtime validation
 */
export function createConfigSchema(
	fields: PluginConfigField[],
): z.ZodSchema<PluginConfig> {
	const schemaFields: Record<string, z.ZodTypeAny> = {};

	for (const field of fields) {
		let fieldSchema: z.ZodTypeAny;

		switch (field.type) {
			case "text":
				fieldSchema = z.string();
				break;
			case "number":
				{
					let numberSchema = z.number();
					if (field.min !== undefined) {
						numberSchema = numberSchema.min(field.min);
					}
					if (field.max !== undefined) {
						numberSchema = numberSchema.max(field.max);
					}
					fieldSchema = numberSchema;
				}
				break;
			case "boolean":
				fieldSchema = z.boolean();
				break;
			case "select":
				if (field.options && field.options.length > 0) {
					const values = field.options.map((opt) => opt.value);
					fieldSchema = z.enum(values as [any, ...any[]]);
				} else {
					fieldSchema = z.unknown();
				}
				break;
			case "file":
				fieldSchema = z.string().url();
				break;
			case "color":
				fieldSchema = z
					.string()
					.regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format");
				break;
			case "range":
				{
					let rangeSchema = z.number();
					if (field.min !== undefined) {
						rangeSchema = rangeSchema.min(field.min);
					}
					if (field.max !== undefined) {
						rangeSchema = rangeSchema.max(field.max);
					}
					fieldSchema = rangeSchema;
				}
				break;
			default:
				fieldSchema = z.unknown();
		}

		// Apply custom validation if provided
		if (field.validation) {
			fieldSchema = fieldSchema.refine((value) => {
				if (!field.validation) return true;
				return field.validation(value) === null;
			});
		}

		// Make field optional if not required
		if (!field.required) {
			fieldSchema = fieldSchema.optional();
		}

		schemaFields[field.key] = fieldSchema;
	}

	return z.object(schemaFields);
}

/**
 * Validates plugin configuration using the field definitions
 */
export function validatePluginConfig(
	config: PluginConfig,
	fields: PluginConfigField[],
): ValidationResult {
	try {
		const schema = createConfigSchema(fields);
		schema.parse(config);
		return { valid: true, errors: [] };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errors = error.issues.map((issue) => {
				const path = issue.path.join(".");
				return `${path}: ${issue.message}`;
			});
			return { valid: false, errors };
		}
		return { valid: false, errors: ["Unknown validation error"] };
	}
}

/**
 * Validates that a config object matches the expected structure
 */
export function validateConfigStructure(
	config: unknown,
	expectedFields: PluginConfigField[],
): ValidationResult {
	const errors: string[] = [];

	if (typeof config !== "object" || config === null) {
		return { valid: false, errors: ["Config must be an object"] };
	}

	const configObj = config as Record<string, unknown>;

	// Check required fields
	for (const field of expectedFields) {
		if (field.required && !(field.key in configObj)) {
			errors.push(`Missing required field: ${field.key}`);
		}
	}

	// Check for unexpected fields
	const expectedKeys = new Set(expectedFields.map((f) => f.key));
	for (const key in configObj) {
		if (!expectedKeys.has(key)) {
			errors.push(`Unexpected field: ${key}`);
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Sanitizes and normalizes config values based on field definitions
 */
export function sanitizeConfig(
	config: PluginConfig,
	fields: PluginConfigField[],
): PluginConfig {
	const sanitized: PluginConfig = {};

	for (const field of fields) {
		const value = config[field.key];

		if (value === undefined || value === null) {
			// Use default value if available
			if (field.defaultValue !== undefined) {
				sanitized[field.key] = field.defaultValue;
			}
			continue;
		}

		// Type-specific sanitization
		switch (field.type) {
			case "number":
			case "range":
				const num = Number(value);
				if (!isNaN(num)) {
					let sanitizedNum = num;
					if (field.min !== undefined) {
						sanitizedNum = Math.max(sanitizedNum, field.min);
					}
					if (field.max !== undefined) {
						sanitizedNum = Math.min(sanitizedNum, field.max);
					}
					sanitized[field.key] = sanitizedNum;
				}
				break;
			case "boolean":
				sanitized[field.key] = Boolean(value);
				break;
			case "text":
			case "file":
			case "color":
				sanitized[field.key] = String(value);
				break;
			case "select":
				if (field.options) {
					const validValues = field.options.map((opt) => opt.value);
					if (validValues.includes(value)) {
						sanitized[field.key] = value;
					} else if (field.defaultValue !== undefined) {
						sanitized[field.key] = field.defaultValue;
					}
				}
				break;
			default:
				sanitized[field.key] = value;
		}
	}

	return sanitized;
}

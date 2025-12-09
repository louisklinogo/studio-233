import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { Prisma, prisma } from "@studio233/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../init";

// Proper schemas that work with JSON serialization
const nodePositionSchema = z.object({
	x: z.number(),
	y: z.number(),
});

const nodeDataSchema = z.object({
	label: z.string().optional(),
	description: z.string().optional(),
	status: z.enum(["idle", "running", "success", "error"]).optional(),
	type: z.string().optional(),
	enabled: z.boolean().optional(),
	pluginId: z.string().optional(),
	config: z.record(z.string(), z.unknown()).optional(), // Plugin-specific config
	lastResult: z.record(z.string(), z.unknown()).optional(),
	lastExecuted: z.string().optional(), // ISO date string
	executionTime: z.number().optional(),
	expanded: z.boolean().optional(),
	showPreview: z.boolean().optional(),
});

const nodeSchema = z.object({
	id: z.string(),
	type: z.string().optional(),
	position: nodePositionSchema,
	data: nodeDataSchema.optional(),
	selected: z.boolean().optional(),
	dragging: z.boolean().optional(),
	width: z.number().optional(),
	height: z.number().optional(),
	zIndex: z.number().optional(),
});

const edgeSchema = z.object({
	id: z.string(),
	source: z.string(),
	target: z.string(),
	sourceHandle: z.string().optional(),
	targetHandle: z.string().optional(),
	type: z.string().optional(),
	animated: z.boolean().optional(),
	hidden: z.boolean().optional(),
	deletable: z.boolean().optional(),
	focusable: z.boolean().optional(),
	style: z.record(z.string(), z.unknown()).optional(),
	className: z.string().optional(),
	zIndex: z.number().optional(),
	ariaLabel: z.string().optional(),
	interactionWidth: z.number().optional(),
	markerStart: z.unknown().optional(),
	markerEnd: z.unknown().optional(),
});

const workflowDefinitionSchema = z.object({
	name: z.string().min(1, "Workflow name is required"),
	description: z.string().optional(),
	projectId: z.string(),
	nodes: z.array(nodeSchema),
	edges: z.array(edgeSchema),
});

async function assertProjectAccess(userId: string, projectId: string) {
	const project = await prisma.project.findFirst({
		where: {
			id: projectId,
			userId: userId,
		},
	});

	if (!project) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Project not found or access denied",
		});
	}

	return project;
}

export const workflowDefinitionRouter = router({
	// Get all workflow definitions for a project
	list: publicProcedure
		.input(z.object({ projectId: z.string() }))
		.query(async ({ input }) => {
			const session = await getSessionWithRetry();
			if (!session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Authentication required",
				});
			}

			await assertProjectAccess(session.user.id, input.projectId);

			const workflows = await prisma.workflowDefinition.findMany({
				where: {
					projectId: input.projectId,
					userId: session.user.id,
				},
				orderBy: {
					updatedAt: "desc",
				},
			});

			return workflows;
		}),

	// Get a specific workflow definition
	get: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const session = await getSessionWithRetry();
			if (!session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Authentication required",
				});
			}

			const workflow = await prisma.workflowDefinition.findFirst({
				where: {
					id: input.id,
					userId: session.user.id,
				},
			});

			if (!workflow) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Workflow not found",
				});
			}

			return workflow;
		}),

	// Create a new workflow definition
	create: publicProcedure
		.input(workflowDefinitionSchema)
		.mutation(async ({ input }) => {
			const session = await getSessionWithRetry();
			if (!session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Authentication required",
				});
			}

			await assertProjectAccess(session.user.id, input.projectId);

			const workflow = await prisma.workflowDefinition.create({
				data: {
					name: input.name,
					description: input.description,
					projectId: input.projectId,
					userId: session.user.id,
					nodes: input.nodes as Prisma.InputJsonValue,
					edges: input.edges as Prisma.InputJsonValue,
				},
			});

			return workflow;
		}),

	// Update an existing workflow definition
	update: publicProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				description: z.string().optional(),
				nodes: z.array(nodeSchema).optional(),
				edges: z.array(edgeSchema).optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const session = await getSessionWithRetry();
			if (!session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Authentication required",
				});
			}

			// Verify ownership
			const existingWorkflow = await prisma.workflowDefinition.findFirst({
				where: {
					id: input.id,
					userId: session.user.id,
				},
			});

			if (!existingWorkflow) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Workflow not found",
				});
			}

			const { id, ...updateData } = input;
			const workflow = await prisma.workflowDefinition.update({
				where: { id },
				data: {
					...updateData,
					nodes: updateData.nodes as Prisma.InputJsonValue | undefined,
					edges: updateData.edges as Prisma.InputJsonValue | undefined,
				},
			});

			return workflow;
		}),

	// Delete a workflow definition
	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const session = await getSessionWithRetry();
			if (!session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Authentication required",
				});
			}

			// Verify ownership
			const existingWorkflow = await prisma.workflowDefinition.findFirst({
				where: {
					id: input.id,
					userId: session.user.id,
				},
			});

			if (!existingWorkflow) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Workflow not found",
				});
			}

			await prisma.workflowDefinition.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),
});

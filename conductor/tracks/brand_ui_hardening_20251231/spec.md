# Specification: Brand Architecture Interface Hardening

## Overview
Audit and redesign the `/brand` page to synchronize its typography, geometry, and component sizing with the established `/settings` standard, while preserving its unique "Industrial Operating System" character and enhancing the first-visitor experience.

## Functional Requirements
- **Typography Synchronization:** Use `font-sans` (Cabinet Grotesk) for primary section headers and `font-mono` (JetBrains Mono) exclusively for technical metadata and labels.
- **Geometric Alignment:** Enforce a strict `rounded-sm` (2px) radius across all industrial plates, inputs, and asset containers.
- **Component Compactness:** Re-scale the Typography `Select` components from `h-14` to a standard compact height matching the `ControlInput` in Settings.
- **Asset Ledger Design:** Redesign the Asset Archive from a generic grid to a "Technical Library" layout featuring metadata labels (REF, TYPE, STATE).
- **System Initialization UX:** Implement "Operational Notes" and a "Setup Checklist" for first-time visitors to address the "Cold Start" problem and frame empty states as technical deficiencies.

## Acceptance Criteria
- [ ] Section titles use the same font weight and size as `SettingsSection` titles.
- [ ] All containers use `border-neutral-200` and `rounded-sm`.
- [ ] The telemetry block (`Initialize_Interface`) is preserved but styled with standard system typography.
- [ ] Asset Archive reflects "LINKED" status with industrial-grade metadata labels.
- [ ] Empty states are framed as "DNA_PRIORS_NOT_SET" or similar technical requirements.

## Out of Scope
- Changing the underlying tRPC or database logic.
- Adding new brand management features (e.g., brand voice settings).

import { BatchStatus, Prisma, prisma } from "./index";

export type BatchJobStatus =
	| "queued"
	| "processing"
	| "verifying"
	| "completed"
	| "failed"
	| "canceled";

export interface StudioBatchJob extends Record<string, unknown> {
	id: string;
	imageUrl: string;
	status: BatchJobStatus;
	resultUrl?: string;
	attempts: number;
	error?: string;
	createdAt: number;
	updatedAt: number;
}

const statusToDb: Record<BatchJobStatus, BatchStatus> = {
	queued: BatchStatus.QUEUED,
	processing: BatchStatus.PROCESSING,
	verifying: BatchStatus.VERIFYING,
	completed: BatchStatus.COMPLETED,
	failed: BatchStatus.FAILED,
	canceled: BatchStatus.CANCELED,
};

const statusFromDb = (status: BatchStatus): BatchJobStatus =>
	status.toLowerCase() as BatchJobStatus;

type DbBatchJob = Prisma.BatchJobGetPayload<{
	include: { items: { orderBy: { createdAt: "asc" }; take: 1 } };
}>;

const mapDbJob = (job: DbBatchJob): StudioBatchJob => {
	const primaryItem = job.items[0];
	const config = (job.config as Prisma.JsonObject | null) ?? null;
	const summary = (job.resultSummary as Prisma.JsonObject | null) ?? null;
	const error = job.error as Prisma.JsonValue | null;
	const imageUrlFromConfig =
		config && typeof config["imageUrl"] === "string"
			? (config["imageUrl"] as string)
			: "";
	const resultUrlFromSummary =
		summary && typeof summary["resultUrl"] === "string"
			? (summary["resultUrl"] as string)
			: undefined;
	return {
		id: job.id,
		imageUrl: primaryItem?.inputUrl ?? imageUrlFromConfig,
		status: statusFromDb(job.status),
		resultUrl: primaryItem?.outputUrl ?? resultUrlFromSummary,
		attempts: job.attempts,
		error: typeof error === "string" ? error : (error as any)?.message,
		createdAt: job.createdAt.getTime(),
		updatedAt: job.updatedAt.getTime(),
	};
};

export const batchStore = {
	async createJob(
		id: string,
		imageUrl: string,
		opts?: {
			userId?: string;
			projectId?: string;
		},
	): Promise<StudioBatchJob> {
		const job = await prisma.batchJob.create({
			data: {
				id,
				status: BatchStatus.QUEUED,
				config: { imageUrl },
				userId: opts?.userId,
				projectId: opts?.projectId,
				items: {
					create: {
						inputUrl: imageUrl,
						status: BatchStatus.QUEUED,
					},
				},
			},
			include: { items: { orderBy: { createdAt: "asc" }, take: 1 } },
		});
		return mapDbJob(job);
	},

	async updateStatus(
		id: string,
		status: BatchJobStatus,
		updates: Partial<StudioBatchJob> = {},
	): Promise<StudioBatchJob | null> {
		const data: Prisma.BatchJobUpdateInput = {
			status: statusToDb[status],
			attempts:
				typeof updates.attempts === "number" ? updates.attempts : undefined,
			error:
				updates.error !== undefined
					? updates.error
						? { message: updates.error }
						: Prisma.JsonNull
					: undefined,
			resultSummary: updates.resultUrl
				? { resultUrl: updates.resultUrl }
				: undefined,
		};

		try {
			const updated = await prisma.batchJob.update({
				where: { id },
				data: {
					...data,
					items: updates.resultUrl
						? {
								updateMany: {
									where: { jobId: id },
									data: {
										outputUrl: updates.resultUrl,
										status: statusToDb[status],
									},
								},
							}
						: undefined,
				},
				include: { items: { orderBy: { createdAt: "asc" }, take: 1 } },
			});

			return mapDbJob(updated);
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2025"
			) {
				return null;
			}
			throw error;
		}
	},
	async getJob(id: string): Promise<StudioBatchJob | null> {
		const job = await prisma.batchJob.findUnique({
			where: { id },
			include: { items: { orderBy: { createdAt: "asc" }, take: 1 } },
		});
		return job ? mapDbJob(job) : null;
	},

	async getJobs(ids: string[]): Promise<StudioBatchJob[]> {
		if (ids.length === 0) return [];

		const jobs = await prisma.batchJob.findMany({
			where: { id: { in: ids } },
			orderBy: { createdAt: "asc" },
			include: { items: { orderBy: { createdAt: "asc" }, take: 1 } },
		});

		return jobs.map(mapDbJob);
	},
};

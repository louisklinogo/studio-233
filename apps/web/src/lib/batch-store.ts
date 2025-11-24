import { kv } from "./kv";

export type BatchJobStatus =
	| "queued"
	| "processing"
	| "verifying"
	| "completed"
	| "failed";

export interface BatchJob {
	id: string;
	imageUrl: string;
	status: BatchJobStatus;
	resultUrl?: string;
	attempts: number;
	error?: string;
	createdAt: number;
	updatedAt: number;
}

const BATCH_PREFIX = "studio:batch:";

export const batchStore = {
	async createJob(id: string, imageUrl: string) {
		const job: BatchJob = {
			id,
			imageUrl,
			status: "queued",
			attempts: 0,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};
		await kv.hset(`${BATCH_PREFIX}${id}`, job);
		return job;
	},

	async updateStatus(
		id: string,
		status: BatchJobStatus,
		updates: Partial<BatchJob> = {},
	) {
		const key = `${BATCH_PREFIX}${id}`;
		const existing = await kv.hgetall<BatchJob>(key);

		if (!existing) return null;

		const updatedJob = {
			...existing,
			...updates,
			status,
			updatedAt: Date.now(),
		};

		await kv.hset(key, updatedJob);
		return updatedJob;
	},

	async getJob(id: string) {
		return await kv.hgetall<BatchJob>(`${BATCH_PREFIX}${id}`);
	},

	async getJobs(ids: string[]) {
		if (ids.length === 0) return [];

		// Pipeline for performance
		const pipeline = kv.pipeline();
		ids.forEach((id) => pipeline.hgetall(`${BATCH_PREFIX}${id}`));
		const results = await pipeline.exec<BatchJob[]>();

		return results;
	},
};

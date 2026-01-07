import { describe, expect, it, mock } from "bun:test";
import { pdfToImages } from "../multimodal-service";

// Mock the pdf-to-img
mock.module("pdf-to-img", () => {
	return {
		pdf: async () => {
			return {
				[Symbol.asyncIterator]: async function* () {
					yield Buffer.from("page1");
					yield Buffer.from("page2");
				},
			};
		},
	};
});
describe("pdfToImages", () => {
	it("should convert pdf to a list of buffers", async () => {
		// We don't really need a real file because pdf-to-img is mocked
		const images = await pdfToImages("fake.pdf");
		expect(images.length).toBe(2);
		expect(images[0].toString()).toBe("page1");
		expect(images[1].toString()).toBe("page2");
	});
	it("should respect maxPages", async () => {
		const images = await pdfToImages("fake.pdf", 1);
		expect(images.length).toBe(1);
		expect(images[0].toString()).toBe("page1");
	});
});

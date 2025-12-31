export interface BrandIdentity {
	primaryColor: string;
	accentColor: string;
	fontFamily: string;
}

export interface BrandAsset {
	name: string;
	url: string;
	type: string;
}

export interface BrandContext {
	identity: BrandIdentity;
	knowledge: string[]; // RAG semantic fragments
	visualDna: string[]; // Vision analysis summaries
	assets: BrandAsset[]; // Primary marks
}

export class InsufficientCreditsError extends Error {
	constructor(message = "Insufficient credits") {
		super(message);
		this.name = "InsufficientCreditsError";
	}
}

export class MissingUserReferenceError extends Error {
	constructor(message = "Unable to resolve user for subscription event") {
		super(message);
		this.name = "MissingUserReferenceError";
	}
}

export class DuplicateLedgerEntryError extends Error {
	constructor(message = "Ledger entry with reference already exists") {
		super(message);
		this.name = "DuplicateLedgerEntryError";
	}
}

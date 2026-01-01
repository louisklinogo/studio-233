async function test() {
	console.log("Testing fetch to Google OAuth2 token endpoint...");
	try {
		const start = Date.now();
		const res = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
		});
		const end = Date.now();
		console.log(
			`Fetch completed in ${end - start}ms with status ${res.status}`,
		);
	} catch (err) {
		console.error("Fetch failed:", err);
	}
}

test();

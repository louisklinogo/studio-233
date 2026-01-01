async function test() {
	const url = "https://api.langwatch.ai";
	console.log(`Testing fetch to LangWatch: ${url}...`);
	try {
		const start = Date.now();
		const res = await fetch(url);
		const end = Date.now();
		console.log(
			`Fetch completed in ${end - start}ms with status ${res.status}`,
		);
	} catch (err) {
		console.error("Fetch failed:", err);
	}
}

test();

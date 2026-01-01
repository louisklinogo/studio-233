async function test() {
	const url = "https://sweet-aphid-28388.upstash.io";
	console.log(`Testing fetch to Upstash: ${url}...`);
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

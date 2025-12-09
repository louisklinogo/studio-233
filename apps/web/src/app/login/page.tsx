import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginPageView } from "@/components/auth/LoginPageView";

export default async function LoginPage() {
	const headerList = await headers();
	const headerRecord = Object.fromEntries(headerList.entries());
	const session = await getSessionWithRetry(headerRecord);

	if (session) {
		redirect("/dashboard");
	}

	return <LoginPageView />;
}

"use server";

import { auth } from "@studio233/auth";
import { prisma } from "@studio233/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
	const headerList = await headers();
	const headerRecord = Object.fromEntries(headerList.entries());
	const session = await auth.api.getSession({ headers: headerRecord });

	if (!session) {
		redirect("/login");
	}

	const userId = session.user.id as string;
	const name = formData.get("name") as string;

	await prisma.user.update({
		where: { id: userId },
		data: {
			hasCompletedOnboarding: true,
			name: name || undefined,
		},
	});

	redirect("/dashboard");
}

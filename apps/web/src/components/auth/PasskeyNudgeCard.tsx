"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { BiometricScanner } from "./BiometricScanner";

export function PasskeyNudgeCard() {
	const [isRegistering, setIsRegistering] = useState(false);

	const handleRegisterPasskey = async () => {
		if (typeof window === "undefined") return;
		if (!("PublicKeyCredential" in window)) {
			toast.error("PASSKEY_NOT_SUPPORTED_ON_THIS_DEVICE");
			return;
		}
		setIsRegistering(true);
		try {
			toast.error("PASSKEY_SUPPORT_UNAVAILABLE_IN_CURRENT_BUILD");
		} catch (error) {
			console.error(error);
			toast.error("PASSKEY_REGISTRATION_FAILED");
		} finally {
			setIsRegistering(false);
		}
	};

	return (
		<div className="border border-neutral-200 dark:border-neutral-900 p-6 space-y-4 bg-white dark:bg-transparent flex flex-col justify-between">
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<p className="font-mono text-xs text-neutral-500 tracking-widest uppercase">
						DEVICE_SECURITY
					</p>
					<span className="font-mono text-[9px] px-2 py-1 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300">
						PASSKEY_READY
					</span>
				</div>
				<p className="font-sans text-xs text-neutral-700 dark:text-neutral-300">
					Link this device for one-touch access. Uses platform biometrics where
					available.
				</p>
			</div>
			<BiometricScanner
				onScan={handleRegisterPasskey}
				isScanning={isRegistering}
			/>
		</div>
	);
}

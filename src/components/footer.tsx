import Link from "next/link";
import { Logo } from "@/components/icons/logo";
import { buttonVariants } from "@/components/ui/button";

export default function Footer() {
	return (
		<>
			<div className="md:mt-auto py-4 border-t border-border">
				<div className="text-center space-y-6">
					<p className="text-sm text-muted-foreground max-w-2xl mx-auto">
						studio+233 - Your AI Creative Studio
					</p>
				</div>
			</div>
		</>
	);
}

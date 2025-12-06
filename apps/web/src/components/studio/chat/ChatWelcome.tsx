import React from "react";
import { cn } from "@/lib/utils";

interface ChatWelcomeProps {
	onSelectTemplate: (template: string) => void;
	userName?: string;
}

export const ChatWelcome: React.FC<ChatWelcomeProps> = ({
	onSelectTemplate,
	userName = "Louis Klinogo",
}) => {
	return null;
};

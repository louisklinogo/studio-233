import { atom } from "jotai";

export type AuthMode = "federated" | "email";

export const authModeAtom = atom<AuthMode>("federated");
export const tunerValueAtom = atom<number>(0); // 0 to 1
export const isPrintingAtom = atom<boolean>(false);
export const isHoveringButtonAtom = atom<AuthMode | null>(null);

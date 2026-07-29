import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { get, writable } from "svelte/store";

export const isBrowser = typeof document !== "undefined";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function shuffleArray<T>(array: T[]): T[] {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}

export function copyStringToClipboard(str: string) {
    if (!isBrowser) return;
    navigator.clipboard.writeText(str);
}

function stripPrompt(str: string) {
    return str.replace(/^\$|> /, "");
}

export function createCopyCodeButton() {
    const codeString = writable("");
    const copied = writable(false);
    let copyTimeout = 0;

    function copyCode() {
        if (!isBrowser) return;
        navigator.clipboard.writeText(stripPrompt(get(codeString)));
        copied.set(true);
        clearTimeout(copyTimeout);
        copyTimeout = window.setTimeout(() => {
            copied.set(false);
        }, 2500);
    }

    function setCodeString(node: HTMLElement) {
        codeString.set(node.innerText.trim() ?? "");
    }

    return {
        copied,
        copyCode,
        setCodeString,
        codeString,
    };
}


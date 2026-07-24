import type { SvelteComponent } from "svelte";
import Logo from "./logo.svelte";
import youtube from "./youtube.svelte";
import twitter from "./twitter.svelte";
import github from "./github.svelte";
import hamburger from "./hamburger.svelte";
import slack from "./slack.svelte";
import discord from "./discord.svelte";

export type Icon = SvelteComponent;

// https://simpleicons.org

export const Icons = {
    logo: Logo,
    YouTube: youtube,
    Twitter: twitter,
    GitHub: github,
    Slack: slack,
    Discord: discord,
    Hamburger: hamburger,
};

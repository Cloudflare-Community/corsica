<script lang="ts">
	import type { TurnstileOptions } from "turnstile-types";
	import { createEventDispatcher, onMount } from "svelte";
	import type { Action } from "svelte/action";

	const dispatch = createEventDispatcher<{
		"turnstile-callback": { token: string };
		"turnstile-error": {};
		"turnstile-expired": {};
		"turnstile-timeout": {};
	}>();

	let loaded = hasTurnstile();
	let mounted = false;

	let widgetId: string;

	export let siteKey: string;

	let style: string = "";
	export { style as class };
	export let theme: TurnstileOptions["theme"] = "auto";
	export let forms = true;

	onMount(() => {
		mounted = true;

		return () => {
			mounted = false;
		};
	});

	function hasTurnstile() {
		if (typeof window == "undefined") return null;
		return "turnstile" in window;
	}

	function loadCallback() {
		loaded = true;
	}

	function error() {
		dispatch("turnstile-error", {});
	}

	function expired() {
		dispatch("turnstile-expired", {});
	}

	function timeout() {
		dispatch("turnstile-timeout", {});
	}

	function callback(token: string) {
		dispatch("turnstile-callback", { token });
	}

	export function reset(): void {
		window.turnstile.reset(widgetId);
	}

	const turnstile: Action = (node) => {
		const id = window.turnstile.render(node, {
			"timeout-callback": timeout,
			"expired-callback": expired,
			"error-callback": error,
			callback,
			sitekey: siteKey,
			"response-field": forms,
			theme
		});

		widgetId = id;

		return {
			destroy: () => {
				window.turnstile.remove(id);
			}
		};
	};
</script>

<svelte:head>
	{#if mounted && !loaded}
		<script
			src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
			on:load={loadCallback}
			async
		></script>
	{/if}
</svelte:head>

{#if loaded && mounted}
	{#key $$props}
		<div class={style} use:turnstile />
	{/key}
{/if}

import type { SaasAuthedEnvironment } from "@corsica/types";
/// <reference types="@sveltejs/kit" />
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	declare namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// eslint-disable-next-line @typescript-eslint/no-empty-interface
		export interface Platform extends SaasAuthedEnvironment {}
	}
}

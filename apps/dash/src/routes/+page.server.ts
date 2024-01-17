import type { Actions } from "./$types";
import { env } from "$env/dynamic/private";
import { fail } from "@sveltejs/kit";
import type { TurnstileResponse } from "../types";

export const actions: Actions = {
	default: async ({ request, platform }) => {
		if (!platform) {
			return new Response();
		}
		const TURNSTILE_KEY = env.TURNSTILE_KEY as string;
		const url = new URL(request.url);
		platform;
		const body = await request.formData();
		const token = body.get("cf-turnstile-response");
		if (!token || token === "") {
			return fail(422, {
				description: "Missing Turnstile Token. Did you forget to click the checkbox?"
			});
		}
		const ip = request.headers.get("cf-connecting-ip") as string;
		const formData = new FormData();
		formData.append("secret", TURNSTILE_KEY);
		formData.append("response", token);
		formData.append("remoteip", ip);
		const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
			body: formData,
			method: "POST"
		});
		const json: TurnstileResponse = await result.json();
		if (!json.success) {
			// We return user-facing errors right away. If the error is internal, continue reading out, then return a generic error,
			// if no user-facing error is found.
			for (const error of json["error-codes"]) {
				switch (error) {
					case "invalid-parsed-secret":
						return fail(422, {
							description: "Invalid Turnstile Key. Please contact the site administrator."
						});
					case "timeout-or-duplicate":
						return fail(422, {
							description:
								"Your Turnstile(CAPTCHA) Token has expired. Please re-verify and try again."
						});
					case "internal-error":
						return fail(500, {
							description: "An internal error occurred. Please try again."
						});
					default:
						console.log("Unhandled Turnstile Error:", error);
				}
			}
			return fail(500, {
				description: "An internal error occurred. Please contact the site administrator."
			});
		}
		if (json.hostname !== url.hostname) {
			return fail(422, {
				description: "Invalid Turnstile Token. Please contact the site administrator."
			});
		}

		return new Response(JSON.stringify(Object.fromEntries(body.entries()), null, "\t"), {
			headers: {
				"content-type": "application/json"
			}
		});
	}
};

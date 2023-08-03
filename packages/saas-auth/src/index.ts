import type { SaasAuthedEnvironment } from "@corsica/types";
import type { MiddlewareHandler } from "hono";

export const authenticationMiddleware: MiddlewareHandler<
	SaasAuthedEnvironment
> = async ({ req, env, set }, next) => {
	const authorization = req.headers.get("authorization");
	if (!authorization) {
		return new Response(null, { status: 401 });
	}
	if (authorization.length !== 64) {
		return new Response(null, { status: 401 });
	}
	const url = new URL(req.url);
	const user = authorization.substring(0, 16);
	const token = authorization.substring(16);
	const team = url.searchParams.get("teamId");
	const headers: HeadersInit = {
		authorization: token,
	};
	if (team) {
		headers.team = team;
	}
	const isAuthorized = (
		await env.USERS.get(env.USERS.idFromName(user)).fetch(
			"https://turbo.internal",
			{
				method: "OPTIONS",
				headers,
			},
		)
	).ok;
	if (!isAuthorized) {
		return new Response(null, { status: 401 });
	}
	set("ASSOCIATED_USER", user);
	await next();
};

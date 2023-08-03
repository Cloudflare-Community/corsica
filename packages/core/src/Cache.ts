import type { SimpleAuthedEnvironment } from "@corsica/types";
import type { MiddlewareHandler } from "hono";

const cache = caches.default;

export const cacheMiddleware: MiddlewareHandler<
	SimpleAuthedEnvironment
> = async ({ req, executionCtx, res }, next) => {
	if (req.method !== "GET" && req.method !== "HEAD") {
		return;
	}
	let cacheRes = await cache.match(req.url);
	if (cacheRes) {
		if (cacheRes.ok) {
			return cacheRes;
		} else {
			executionCtx.waitUntil(cache.delete(req.url));
		}
	}
	await next();
	if (!res.ok) {
		return;
	}
	cacheRes = res.clone();
	cacheRes.headers.set(
		"cloudflare-cdn-cache-control",
		`max-age=${res.headers.get("x-artifact-duration")}`,
	);
	executionCtx.waitUntil(cache.put(req.url, cacheRes));
};

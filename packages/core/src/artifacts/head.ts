import { head as CORSHeaders } from "./CORS.json";
import type { SimpleAuthedEnvironment } from "@corsica/types";
import type { Handler } from "hono";

// HEAD /v8/artifacts/:hash
export const headArtifact: Handler<SimpleAuthedEnvironment> = async ({
	req,
	env,
	get,
	executionCtx,
}) => {
	const objectName = "artifacts/" + req.param("hash");
	const r2Object = await env.R2.head(objectName);
	if (!(r2Object && r2Object.customMetadata)) {
		executionCtx.waitUntil(env.R2.delete(objectName));
		return new Response(null, {
			status: 404,
			headers: CORSHeaders,
		});
	}
	if (globalThis.MINIFLARE) {
		console.log(
			`Received HEAD request for artifact "${req.param(
				"hash",
			)}" from user "${get("ASSOCIATED_USER")}" with User-Agent "${
				req.headers.get("user-agent") || ""
			}".`,
		);
	} else {
		env.AE.writeDataPoint({
			blobs: ["HEAD", req.param("hash"), req.headers.get("user-agent") || ""],
		});
	}
	const headers: Record<string, string> = {
		...CORSHeaders,
		"content-type":
			r2Object.httpMetadata?.contentType || "application/octet-stream",
		"content-length": r2Object.size.toString(),
		"last-modified": r2Object.uploaded.toISOString(),
		"x-artifact-client-ci": r2Object.customMetadata.createdByCI,
		"x-artifact-duration": Math.floor(
			(parseInt(r2Object.customMetadata.expireAt) - Date.now()) / 1000,
		).toString(),
	};
	if (r2Object.customMetadata.tag) {
		headers["x-artifact-tag"] = r2Object.customMetadata.tag;
	}
	return new Response(null, {
		headers,
		status: 204,
	});
};

import type { Handler } from "hono";
import { headArtifact } from "./head";
import { get as CORSHeaders } from "./CORS.json";

// GET /v8/artifacts/:hash
export const getArtifact: Handler<Environment> = async (ctx, next) => {
  const { req, env, get, executionCtx } = ctx;
  if(req.method === "HEAD") {
    return headArtifact(ctx, next);
  }
  const objectName = "artifacts/" + req.param("hash");
  const r2Object = await env.R2.get(objectName);
  if(!(r2Object && r2Object.customMetadata)) {
    executionCtx.waitUntil(env.R2.delete(objectName));
    return new Response(null, {
      status: 404,
      headers: CORSHeaders
    });
  }
  if(globalThis.MINIFLARE) {
    console.log(`Received GET request for "${req.param("hash")}" from user "${get("ASSOCIATED_USER")}" with User-Agent "${req.headers.get("user-agent") || ""}".`);
  } else {
    env.AE.writeDataPoint({
      blobs: [
        "GET", req.param("hash"), get("ASSOCIATED_USER"), req.headers.get("user-agent") || ""
      ]
    });
  }
  const headers: Record<string, string> = {
    ...CORSHeaders,
    "content-type": r2Object.httpMetadata?.contentType || "application/octet-stream",
    "content-length": r2Object.size.toString(),
    "x-artifact-client-ci": r2Object.customMetadata.createdByCI,
    "x-artifact-duration": Math.floor((parseInt(r2Object.customMetadata.expireAt) - Date.now()) / 1000).toString(),
  };
  if(r2Object.httpMetadata?.contentType) {
    headers["content-type"] = r2Object.httpMetadata.contentType;
  }
  if (r2Object.customMetadata.tag) {
    headers["x-artifact-tag"] = r2Object.customMetadata.tag;
  }
  return new Response(r2Object.body, {
    headers
  });
};
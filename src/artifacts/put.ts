import type { Handler } from "hono";
import { put as CORSHeaders } from "./CORS.json";

// PUT /v8/artifacts/:hash
export const putArtifact: Handler<Environment> = async ({ req, env, get }) => {
  const customMetadata: Record<string, string> = {
    userName: get("ASSOCIATED_USER"),
    createdByCI: req.headers.get("x-artifact-client-ci") || "false"
  };
  const tag = req.headers.get("x-artifact-tag");
  if(tag) {
    customMetadata.tag = tag;
  }
  const objectName = "artifacts/" + req.param("hash");
  let expirationDuration = parseInt(req.headers.get("x-artifact-duration") || "");
  if(isNaN(expirationDuration)) {
    expirationDuration = 604800;
  }
  const expireAt = Date.now() + expirationDuration * 1000;
  customMetadata.expireAt = expireAt.toString();
  await Promise.all([env.R2.put(objectName, req.body, {
    httpMetadata: {
      contentType: req.headers.get("content-type") || "application/octet-stream"
    },
    customMetadata
  }), env.EXPIRE.get(env.EXPIRE.idFromName(objectName)).fetch("https://turbo.internal/" + objectName, {
    headers: {
      expiration: customMetadata.expireAt,
    }
  })]);
  if(globalThis.MINIFLARE) {
    console.log(`Received PUT request for artifact "${req.param("hash")}" from user "${get("ASSOCIATED_USER")}" with User-Agent "${req.headers.get("user-agent") || ""}" which expires at ${new Date(expireAt).toLocaleDateString("en-UK")}.`);
  } else {
    env.AE.writeDataPoint({
      blobs: [
        "PUT", req.param("hash"), get("ASSOCIATED_USER"), req.headers.get("user-agent") || "", req.headers.get("x-artifact-tag") || ""
      ],
      doubles: [
        expireAt,
      ]
    });
  }
  return new Response(null, {
    status: 201,
    headers: CORSHeaders
  });
};
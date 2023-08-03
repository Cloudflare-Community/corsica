import { get, head, put } from "./CORS.json";
import type { SimpleAuthedEnvironment } from "@corsica/types";
import type { Handler } from "hono";

// OPTIONS /v8/artifacts/:hash
export const optionsArtifact: Handler<SimpleAuthedEnvironment> = async ({
	req,
}) => {
	switch (req.headers.get("access-control-request-method")) {
		case "GET":
			return new Response(null, {
				headers: get,
				status: 204,
			});
		case "HEAD":
			return new Response(null, {
				headers: head,
				status: 204,
			});
		case "PUT":
			return new Response(null, {
				headers: put,
				status: 204,
			});
		default:
			return new Response(null, {
				status: 405,
			});
	}
};

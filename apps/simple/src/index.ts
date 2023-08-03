import {
	cacheMiddleware,
	getArtifact,
	optionsArtifact,
	putArtifact,
} from "@corsica/core";
import { authenticationMiddleware } from "@corsica/simple-auth";
import { Hono } from "hono";
import type { SimpleAuthedEnvironment, BaseBindings } from "@corsica/types";

const app = new Hono<SimpleAuthedEnvironment>();

app.get(
	"/v8/artifacts/:hash",
	authenticationMiddleware,
	cacheMiddleware,
	getArtifact,
);
app.options("/v8/artifacts/:hash", optionsArtifact);
app.put("/v8/artifacts/:hash", authenticationMiddleware, putArtifact);

app.notFound((ctx) => {
	ctx.status(404);
	return ctx.text("Not Found");
});

export default <ExportedHandler<BaseBindings>>{
	fetch: app.fetch,
};

export { Expire } from "@corsica/durables";

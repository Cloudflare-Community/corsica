import { Hono } from "hono";
import { authenticationMiddleware, cacheMiddleware } from "./Middleware";
import { getArtifact, optionsArtifact, putArtifact } from "./artifacts";

const app = new Hono<Environment>();

app.get("/v8/artifacts/:hash", authenticationMiddleware, cacheMiddleware, getArtifact);
app.options("/v8/artifacts/:hash", authenticationMiddleware, optionsArtifact);
app.put("/v8/artifacts/:hash", authenticationMiddleware, putArtifact);

app.notFound((ctx) => {
  ctx.status(404);
  return ctx.text("Not Found");
});

export default <ExportedHandler<EnvBindings>> {
  fetch: app.fetch
};

export { default as Expire } from "./Expire";
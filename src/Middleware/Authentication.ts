import type { MiddlewareHandler } from "hono";

export const authenticationMiddleware: MiddlewareHandler<Environment> = async({ req, env, set }, next) => {
  const keys: Record<string, string> = JSON.parse(env.AUTH_TOKENS);
  const token = req.headers.get("authorization");
  if(!token) {
    return new Response(null, {
      status: 401,
    });
  }
  const parsedToken = token.match(/^Bearer (.+)$/);
  if(!(parsedToken && keys[parsedToken[1]])) {
    return new Response(null, {
      status: 401,
    });
  }
  set("ASSOCIATED_USER", keys[parsedToken[1]]);
  await next();
};
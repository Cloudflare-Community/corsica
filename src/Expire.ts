export default class Expire {
  private readonly state: DurableObjectState;
  private readonly env: EnvBindings;
  
  constructor(state: DurableObjectState, env: EnvBindings) {
    this.state = state;
    this.env = env;
  }

  async alarm() {
    const object = await this.state.storage.get<string>("object");
    if(!object) {
      return;
    }
    await Promise.all([this.env.R2.delete(object), this.state.storage.delete("object")]);
  }

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const object = url.pathname.slice(1);
    const expiration = req.headers.get("expiration");
    if(!expiration) {
      return new Response("Missing duration header", {
        status: 400
      });
    }
    await Promise.all([this.state.storage.put("object", object), this.state.storage.setAlarm(parseInt(expiration))]);
    return new Response(null);
  }
}
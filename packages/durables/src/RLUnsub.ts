const MAX_INTERACTIONS = 10;
const TIME_WINDOW = 6.048e8; // 1 Week in milliseconds

// RLUNsub is a Durable Object class that handles rate limiting and unsubscribing.
// Each unique email address gets its own Durable Object instance.
// Currently, this is configured to allow a maximum of 10 emails to be sent per week.
export class RLUnSub {
	private readonly state: DurableObjectState;
	private previousSends?: number[];
	private unsubs?: Set<string> | true;
	constructor(state: DurableObjectState) {
		this.state = state;
	}
	async alarm() {
		if (this.previousSends === undefined) {
			this.previousSends = await this.state.storage.get("previousSends", {
				noCache: true,
			});
			if (this.previousSends === undefined) {
				this.previousSends = [];
				return;
			}
		}
		const now = Date.now();
		this.previousSends = this.previousSends.filter(
			(interaction) => interaction > now,
		);
		await this.state.storage.put("previousSends", this.previousSends, {
			noCache: true,
		});
		await this.state.storage.setAlarm(this.previousSends[0]);
	}
	async fetch({ url, method }: Request): Promise<Response> {
		const appId = new URL(url).pathname.slice(1);
		if (this.previousSends === undefined) {
			this.previousSends = await this.state.storage.get("previousSends", {
				noCache: true,
			});
			if (this.previousSends === undefined) {
				this.previousSends = [];
			}
		}
		if (this.unsubs === undefined) {
			this.unsubs = await this.state.storage.get("unsubs", { noCache: true });
			if (this.unsubs === undefined) {
				this.unsubs = new Set();
			}
		}
		if (method === "PUT" && this.unsubs !== true) {
			if (appId.length > 0) {
				this.unsubs.add(appId);
			} else {
				this.unsubs = true;
			}
			await this.state.storage.put("unsubs", this.unsubs, { noCache: true });
			return new Response();
		}
		if (method === "DELETE") {
			let changed = false;
			if (appId.length > 0) {
				if (this.unsubs !== true) {
					this.unsubs.delete(appId);
					changed = true;
				}
			} else if (this.unsubs !== true) {
				this.unsubs = true;
				changed = true;
			}
			if (changed) {
				await this.state.storage.put("unsubs", this.unsubs, { noCache: true });
			}
			return new Response();
		}
		if (method !== "GET") {
			return new Response(null, { status: 405 });
		}
		if (this.unsubs === true) {
			return new Response("Global Unsubscribe", { status: 403 });
		}
		if (this.unsubs.has(appId)) {
			return new Response("App Unsubscribe", { status: 403 });
		}
		if (this.previousSends.length >= MAX_INTERACTIONS) {
			return new Response(null, { status: 429 });
		}
		this.previousSends.push(Date.now() + TIME_WINDOW);
		await this.state.storage.put("previousSends", this.previousSends, {
			noCache: true,
		});
		if (this.previousSends.length === 1) {
			await this.state.storage.setAlarm(this.previousSends[0]);
		}
		return new Response();
	}
}

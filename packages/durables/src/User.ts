import { nanoid } from "nanoid";
import type { User as UserStruct } from "@corsica/types";

export class User {
	private readonly state: DurableObjectState;
	private data?: UserStruct;
	constructor(state: DurableObjectState) {
		this.state = state;
	}
	async getData(): Promise<UserStruct | void> {
		if (this.data) {
			return this.data;
		}
		const data = await this.state.storage.get<UserStruct>("data");
		if (!data) {
			return;
		}
		this.data = data;
		return data;
	}
	async fetch(req: Request): Promise<Response> {
		const data = await this.getData();
		switch (req.method) {
			case "OPTIONS": {
				if (!data) {
					return new Response(null, {
						status: 404,
					});
				}
				const auth = req.headers.get("authorization") as string;
				if (auth !== data.apiKey) {
					return new Response(null, {
						status: 403,
					});
				}
				const team = req.headers.get("team") as string;
				if (team !== null && !data.teams.includes(team)) {
					return new Response(null, {
						status: 403,
					});
				}
				return new Response();
			}
			case "GET": {
				if (!data) {
					return new Response(null, {
						status: 404,
					});
				}
				return Response.json(data);
			}
			case "POST": {
				let id: string = nanoid(32);
				let teams: string[] = [];
				let createdAt: number = Date.now();
				if (data) {
					if (data.id) {
						id = data.id;
					}
					if (data.teams) {
						teams = data.teams;
					}
					if (data.createdAt) {
						createdAt = data.createdAt;
					}
				}
				const incoming = await req.json<User>();
				this.data = {
					name: "",
					apiKey: nanoid(32),
					isSynthetic: true,
					...data,
					...incoming,
					id,
					teams,
					createdAt,
				};
				await this.state.storage.put("data", this.data);
				return new Response();
			}
			case "PUT": {
				if (!data) {
					return new Response(null, {
						status: 404,
					});
				}
				data.teams.push(await req.text());
				await this.state.storage.put("data", data);
				this.data = data;
				return new Response();
			}
			case "DELETE": {
				if (!data) {
					return new Response(null, {
						status: 404,
					});
				}
				const team = await req.text();
				if (!team || team === "") {
					await this.state.storage.deleteAll();
					this.data = undefined;
					return new Response();
				}
				data.teams = data.teams.filter((a) => a !== team);
				await this.state.storage.put("data", data);
				this.data = data;
				return new Response();
			}
			case "PATCH": {
				if (!data) {
					return new Response(null, {
						status: 404,
					});
				}
				data.apiKey = nanoid(32);
				this.data = data;
				await this.state.storage.put("data", data);
				return new Response();
			}
			default: {
				return new Response(null, {
					status: 405,
				});
			}
		}
	}
}

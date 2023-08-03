import { nanoid } from "nanoid";
import type { TeamStruct, TeamStructUpdate } from "@corsica/types";

export class Team {
	private readonly state: DurableObjectState;
	private data?: TeamStruct;
	constructor(state: DurableObjectState) {
		this.state = state;
	}
	async getData(): Promise<TeamStruct | void> {
		if (this.data) {
			return this.data;
		}
		const data = await this.state.storage.get<TeamStruct>("data");
		if (!data) {
			return;
		}
		this.data = data;
		return data;
	}
	async fetch(req: Request): Promise<Response> {
		const data = await this.getData();
		switch (req.method) {
			case "POST": {
				let id: string = nanoid(32);
				let createdAt: number = Date.now();
				let teamMembers: string[] = [];
				if (data) {
					if (data.id) {
						id = data.id;
					}
					if (data.createdAt) {
						createdAt = data.createdAt;
					}
					if (data.teamMembers) {
						teamMembers = data.teamMembers;
					}
				}
				const incoming = await req.json<TeamStructUpdate>();
				this.data = {
					id,
					name: "",
					owner: "",
					...incoming,
					...data,
					createdAt,
					teamMembers,
				};
				await this.state.storage.put("data", this.data);
				return new Response();
			}
			case "PUT": {
				if (!data) {
					return new Response("Not found", { status: 404 });
				}
				data.teamMembers.push(await req.text());
				this.data = data;
				await this.state.storage.put("data", this.data);
				return new Response();
			}
			case "GET": {
				if (!data) {
					return new Response("Not found", { status: 404 });
				}
				return Response.json(data);
			}
			case "DELETE": {
				if (!(data && this.data)) {
					return new Response();
				}
				const ifUser = await req.text();
				if (ifUser !== "") {
					if (ifUser === data.owner) {
						return new Response(null, {
							status: 409,
						});
					}
					this.data.teamMembers = data.teamMembers.filter(
						(user) => user !== ifUser,
					);
					await this.state.storage.put("data", this.data);
					return new Response();
				}
				await this.state.storage.deleteAll();
				return new Response();
			}
			default: {
				return new Response(null, { status: 405 });
			}
		}
	}
}

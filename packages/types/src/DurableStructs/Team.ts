interface TeamStruct {
	id: string;
	name: string;
	createdAt: number;
	owner: string;
	teamMembers: string[];
}

interface TeamStructUpdate {
	name?: string;
	owner?: string;
}

export type { TeamStruct, TeamStructUpdate };

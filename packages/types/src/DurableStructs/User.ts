interface BaseUser {
	id: string;
	name: string;
	isSynthetic: boolean;
	apiKey: string;
	createdAt: number;
	teams: string[];
}

interface RealUser extends BaseUser {
	email: string;
	isSynthetic: false;
}

interface SyntheticUser extends BaseUser {
	isSynthetic: true;
}

export type User = RealUser | SyntheticUser;

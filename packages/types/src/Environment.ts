import type { Env } from "hono";
type BaseBindings = {
	AE: AnalyticsEngineDataset;
	RLUNSUB: DurableObjectNamespace;
	EXPIRE: DurableObjectNamespace;
	R2: R2Bucket;
};

interface SimpleAuthedEnvironment extends Env {
	Bindings: BaseBindings & {
		AUTH_TOKENS: string;
	};
	Variables: { ASSOCIATED_USER: string };
}

interface SaasAuthedEnvironment extends Env {
	Bindings: BaseBindings & {
		TEAMS: DurableObjectNamespace;
		USERS: DurableObjectNamespace;
	};
	Variables: { ASSOCIATED_USER: string };
}

export type { BaseBindings, SimpleAuthedEnvironment, SaasAuthedEnvironment };

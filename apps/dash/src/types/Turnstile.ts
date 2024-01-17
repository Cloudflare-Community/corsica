interface TurnstileBase {
	challenge_ts: string;
	hostname: string;
	action?: string;
	cdata?: string;
}

type TurnstileSuccess = TurnstileBase & {
	success: true;
	"error-codes": [];
};

type TurnstileErrorCodes =
	| "missing-input-secret"
	| "invalid-input-secret"
	| "missing-input-response"
	| "invalid-input-response"
	| "invalid-widget-id"
	| "invalid-parsed-secret"
	| "bad-request"
	| "timeout-or-duplicate"
	| "internal-error";

type TurnstileFailure = Partial<TurnstileBase> & {
	success: false;
	"error-codes": TurnstileErrorCodes[];
};

export type TurnstileResponse = TurnstileSuccess | TurnstileFailure;

# Corsica

_[Turborepo](https://turbo.build/repo)-compatible Remote Cache built on the Supercloud_

**A [Cloudflare Community](https://github.com/Cloudflare-Community) Project**

**NOTE: We are currently in the process of moving to a monorepo structure for this project, to allow for the Simple and the SaaS Architecture to be developed in parallel. The structure of the repository may change in the near future.**

**LEGAL: This Github Repository, and the Organization it belongs to, is not managed or maintained by Cloudflare, or its employees. This project and/or this Organization are not condoned/recommended by Cloudflare. Views expressed here do not represent the views of Cloudflare or its employees. All rights to the Cloudflare Logo and other assets belong to Cloudflare Inc.**

Corsica is a remote cache for Turborepo that uses Cloudflare [Workers](https://developers.cloudflare.com/workers) and [R2](https://developers.cloudflare.com/r2) to store build artifacts. It automatically caches, and subsequently invalidates, build artifacts for your Turborepo projects. It also collects analytics on the build artifacts that are cached, using [Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/).

## Todo

- Corsica doesn't currently handle Vercel Analytics events. Is this worth pursuing?

## Setup

### Cache

1. Clone the repo, and install dependencies with `pnpm`(now required for Workspaces support).
2. Generate your API tokens and usernames. They should be in the following format:

```json
{
	"<key>": "<username>",
	"1Il6JKzywIzeDkiJVnh56": "alastair"
	// ...
}
```

3. Move to [`apps/simple`](apps/simple)
4. Replace the `account_id` and `route` fields in your `wrangler.json` file with your Cloudflare account ID and the route you want to use for your cache.
5. Deploy the API token json as an environment variable called `API_TOKENS` in your Cloudflare Worker.

```bash
$ wrangler secret put -j AUTH_TOKENS
 ⛅️ wrangler 3.4.0
------------------
✔ Enter a secret value: …
🌀 Creating the secret for the Worker "turbo"
✨ Success! Uploaded secret AUTH_TOKENS
```

6. Deploy the Worker

```bash
$ wrangler deploy -j
 ⛅️ wrangler 3.4.0
------------------
Your worker has access to the following bindings:
- Durable Objects:
  - EXPIRE: Expire
- R2 Buckets:
  - R2: turbo
- Analytics Engine Datasets:
  - AE: TurborepoAnalytics
Total Upload: 23.55 KiB / gzip: 8.48 KiB
Uploaded turbo (3.89 sec)
Published turbo (8.33 sec)
  turbo.goalastair.com (custom domain)
Current Deployment ID: f6bfbc67-3ba0-4c6d-ac53-835b6a6af8ad
```

### In your repository

1. Create a `.turbo/config.json` file in the root of your repository. At the moment, it appears that `turbo` [requires a `teamid` to be defined for it to enable remote caching](https://github.com/vercel/turbo/blob/8f3ec2c79713273da54469cfdfcfcea66cb9d206/cli/internal/client/client.go#L81-L83). While `corsica` doesn't currently silo caches by team, you'll need to define a `teamid` in your config file. It can be anything you want, as long as it's a string.

```json
{
  "apiurl": "<Your Worker Domain>",
  "teamid": "<Your Team ID>
}
```

2. Add an environment variable to your shell called `TURBO_TOKEN`, with the value of your API token.
3. **_\>\>\> FULL TURBO_**

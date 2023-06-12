# Corsica

*[Turborepo](https://turbo.build/repo)-compatible Remote Cache built on the Supercloud*

**A [Cloudflare Community](https://github.com/Cloudflare-Community) Project**

**NOTE: This Github Repository, and the Organization it belongs to, is not managed or maintained by Cloudflare, or its employees. This project and/or this Organization are not condoned/recommended by Cloudflare. Views expressed here do not represent the views of Cloudflare or its employees. All rights to the Cloudflare Logo and other assets belong to Cloudflare Inc.**

Corsica is a remote cache for Turborepo that uses Cloudflare [Workers](https://developers.cloudflare.com/workers) and [R2](https://developers.cloudflare.com/r2) to store build artifacts. It automatically caches, and subsequently invalidates, build artifacts for your Turborepo projects. It also collects analytics on the build artifacts that are cached, using [Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/).


## Todo
- Figure out how to handle authentication. Currently, the cache requires a secret to be set, which isn't very scalable.
- Add config options, as necessary.
- Evaluate whether Vercel Teams Support is necessary.
- Corsica doesn't currently handle Vercel Analytics events. Is this worth pursuing?

## Setup

### Cache

1. Clone the repo, and install dependencies with your Node package manager of choice.
2. Generate your API tokens and usernames. They should be in the following format:
```json
{
  "<key>": "<username>",
  "1Il6JKzywIzeDkiJVnh56": "alastair"
  // ...
}
```
3. Replace the `account_id` and `route` fields in your `wrangler.json` file with your Cloudflare account ID and the route you want to use for your cache.
4. Deploy the API token json as an environment variable called `API_TOKENS` in your Cloudflare Worker.
```bash
$ wrangler secret put -j AUTH_TOKENS
 ⛅️ wrangler 3.1.0
------------------
✔ Enter a secret value: …
🌀 Creating the secret for the Worker "turbo" 
✨ Success! Uploaded secret AUTH_TOKENS
```
5. Deploy the Worker
```bash
$ wrangler deploy -j
 ⛅️ wrangler 3.1.0
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

1. Create a `.turbo/config.json` file in the root of your repository.
```json
{
  "apiurl": "<Your Worker Domain>",
}
```
2. Add an environment variable to your shell called `TURBO_TOKEN`, with the value of your API token.
3. ***\>\>\> FULL TURBO***
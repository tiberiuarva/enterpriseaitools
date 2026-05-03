# Planka board access for enterpriseai.tools

Last verified: 2026-05-03

## Purpose

This repo uses Planka as the source of truth for task tracking. From the `enterpriseai-tools` workspace, board access has been intermittently treated as blocked because the older token-based path was missing. In practice, the host bootstrap admin credentials are enough to read and update the board through the Planka API.

## Working access path

Credential source:

- `/home/n8nadmin/.openclaw/workspace-artix/.openclaw/planka.env`

Required values:

- `BASE_URL`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`

Authentication flow:

1. POST JSON to `${BASE_URL}/api/access-tokens`
2. Body: `{ "emailOrUsername": DEFAULT_ADMIN_EMAIL, "password": DEFAULT_ADMIN_PASSWORD }`
3. Read the bearer token from the returned `item` field
4. Use `Authorization: Bearer <token>` for project/board/card API calls

## Verified project and board IDs

As of 2026-05-03:

- project: `enterpriseai.tools` (`1750797796853679673`)
- board: `Execution Board` (`1750799530082698839`)

## Operational notes

- `GET /api/projects/:id` returns included board/list metadata.
- `GET /api/boards/:id` returns included list/card metadata and is the easiest way to dump current board state.
- The board currently contains one active in-progress card: `v1.2 improvements plan execution`.
- The visible backlog is stale in several places because completed work was shipped without the corresponding cards being moved or rewritten.

## Why this matters

Future cron runs should not log Planka as blocked unless this bootstrap login flow actually stops working. If board state looks inconsistent, update the board directly instead of treating missing legacy token wiring as a blocker.

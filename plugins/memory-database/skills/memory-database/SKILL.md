---
name: memory-database
description: Search and retrieve messages from ET's memory database (196K+ messages across Telegram, Discord, iMessage, Email, Notes, Google Chat, OpenClaw, ChatGPT, Anthropic). Read-only access. Use when recalling past conversations, finding what someone said, searching message history, looking up attachments, or answering "when did I/we talk about X" questions. Also use for people lookup and message context retrieval. Triggers on: "what did I say about", "find messages", "search messages", "who said", "conversation history", "look up messages", "message search", "remember when", "find that conversation", or any recall question that memory_search alone can't answer.
allowed-tools: Bash(curl *)
---

# Memory Database

Read-only access to ET's unified message archive via the Memory Database API.

## Setup

Ensure `${CLAUDE_SKILL_DIR}/.env` contains:
```
MEMORY_DATABASE_API_URL=https://memory-database.etdofresh.com
MEMORY_DATABASE_API_TOKEN=your-token-here
```

## Environment

```bash
source "${CLAUDE_SKILL_DIR}/.env"
export MEMORY_DATABASE_API_URL MEMORY_DATABASE_API_TOKEN
```

All requests require `Authorization: Bearer $MEMORY_DATABASE_API_TOKEN` header.

## Read-Only Endpoints

### Search messages (most common)
```
GET /api/messages/search?q=<query>&limit=20&offset=0
```
Full-text search across all message content. Start here for most recall questions.

### List messages (filtered)
```
GET /api/messages?source=<source>&sender=<name>&recipient=<name>&after=<ISO>&before=<ISO>&limit=20&offset=0
```
Sources: `telegram`, `discord`, `imessage`, `email`, `notes`, `google_chat`, `openclaw`, `chatgpt`, `anthropic`

### Message history (conversation thread)
```
GET /api/messages/<record_id>/history
```
Get surrounding messages for context around a specific message.

### People
```
GET /api/people
```
List all known contacts with aliases and metadata.

### Sources
```
GET /api/sources
```
List all message sources with counts.

### Stats
```
GET /api/stats
```
Database-wide statistics.

### Get attachments for a message
```
GET /api/messages/<record_id>/attachments
```

### Search/filter attachments
```
GET /api/attachments?q=<query>&mime_type=<type>&file_type=<type>&limit=20
```

### Download attachment file
```
GET /api/attachments/<record_id>/file
```
Returns raw file bytes with correct content-type.

## Usage Pattern

1. **Start with search:** `GET /api/messages/search?q=<terms>&limit=10`
2. **Narrow with filters:** Add `source`, `sender`, `after`, `before` params
3. **Get context:** Use `/history` endpoint on a specific message's `record_id`
4. **Find attachments:** Check `/api/messages/<id>/attachments` for media

## Implementation

```bash
source "${CLAUDE_SKILL_DIR}/.env"
export MEMORY_DATABASE_API_URL MEMORY_DATABASE_API_TOKEN

curl -s -H "Authorization: Bearer $MEMORY_DATABASE_API_TOKEN" \
  "$MEMORY_DATABASE_API_URL/api/messages/search?q=search+terms&limit=10" | python3 -m json.tool
```

**Do not** use POST/PUT/PATCH/DELETE endpoints — this skill is read-only.

## Troubleshooting

If the API token returns 401, check/refresh the token:
1. Check `MEMORY_DATABASE_API_TOKEN` in `${CLAUDE_SKILL_DIR}/.env`
2. Ask ET to verify/rotate the token via the admin UI at https://memory-database.etdofresh.com/admin

## Tips
- Combine with `memory_search` for best recall coverage (memory files + message DB)
- For sender names, try partial matches — the API uses ILIKE
- Use `after`/`before` ISO timestamps to narrow date ranges
- Response includes `record_id` (UUID) for cross-referencing attachments
- Large result sets: use `offset` for pagination

# Connect ILOS to Tana (Tana MCP setup)

ILOS works fully without Tana. Connect it only if you want your wins, goals and decisions to also live in your Tana Outliner workspace. Claude talks to Tana through an **MCP server**, and Tana offers two:

| | **Remote** (recommended) | **Local** |
|---|---|---|
| Tana plan | Paid plan (the remote server is in beta) | Any plan, free |
| Tana desktop app | Can be closed | Must be open |
| Works in | Claude Code, Claude Cowork / Claude Desktop, claude.ai | Claude Code on the same computer |
| Sign-in | Tana account (OAuth), once | Approve in the Tana desktop app, or a personal API token |
| Address | `https://app.tana.inc/mcp` | `http://localhost:8262/mcp` |

Pick one. Name it `tana` in either case, so you can switch later without changing anything else. Then run `/tana-setup` (step 4).

---

## 1. Remote server in Claude Code

1. In a terminal, add the server for your user account (works in every folder):

   ```bash
   claude mcp add --transport http --scope user tana https://app.tana.inc/mcp
   ```

2. Start Claude Code in your ILOS folder (`claude`) and type `/mcp`.
3. Select `tana` and follow the sign-in steps: your browser opens; sign in to Tana Outliner and allow the connection. (From a terminal, `claude mcp login tana` does the same.)
4. Back in Claude Code, `/mcp` shows `tana` as **✔ Connected**. Check it by asking: *"list my Tana workspaces"*. You should see your workspaces by name.

## 2. Remote server in Claude Cowork, Claude Desktop or claude.ai

Connectors you add on claude.ai also appear in Cowork and Claude Desktop (same Claude account).

1. Open **Customize → Connectors** and click **Add custom connector**.
2. Name it `tana`, paste `https://app.tana.inc/mcp`, choose **Sign in now**, and add it.
3. Sign in to Tana Outliner and allow the connection.
4. In a new conversation, ask *"list my Tana workspaces"*.

On the Free Claude plan you can have one custom connector. On Team and Enterprise plans an owner adds the connector for the organization, then you click **Connect**. The local server cannot be used here: these apps reach connectors from the internet, not from your computer.

## 3. Local server in Claude Code (free plan)

The local server runs inside the Tana Outliner desktop app, and is on whenever the app is open.

1. Keep Tana Outliner desktop open, then in a terminal:

   ```bash
   claude mcp add --transport http --scope user tana http://localhost:8262/mcp
   ```

   (Tana can also do this for you: in the desktop app, **OS menu → Options → Local API settings**. The server may then have another name, such as `tana-local`; ILOS works with any name.)

2. Start Claude Code in your ILOS folder and type `/mcp` → `tana` and follow the sign-in steps. Tana desktop shows an approval window; approve it, and a browser page confirms you are signed in.
3. Check it: *"list my Tana workspaces"*.

**If the sign-in does not work**, use a personal API token instead. In Tana Outliner: your profile (top right) → **API tokens** → **Personal Tokens** → create one. Then add the server with the token:

```bash
claude mcp remove tana
claude mcp add --transport http --scope user tana http://localhost:8262/mcp --header "Authorization: Bearer <your token>"
```

Keep the token private: it gives access to your whole Tana graph.

## 4. Then run `/tana-setup`

In your ILOS folder, type `/tana-setup`. It checks the connection, finds your workspace and the tags, fields and nodes ILOS uses, writes them to `SYSTEM/tana-ids.yaml`, tells you what your workspace is missing, and asks how much you want to sync. You do this once; after that, `/sync` keeps local files and Tana in step.

---

## Troubleshooting

- **`/mcp` shows `tana` as "✘ Failed to connect" or "! Needs authentication".** Select it and sign in again (or choose **Clear authentication**, then sign in). For the local server, check that Tana desktop is open. `claude mcp list` shows every server and whether it is reachable.
- **`tana` is not in `/mcp` at all.** Run `claude mcp get tana`. If it is missing, add it again (step 1 or 3); if you added it while Claude was open, start Claude again.
- **Remote server keeps asking you to sign in, or refuses access.** The remote server needs a paid Tana Outliner plan. On a free plan, use the local server (step 3).
- **ILOS says "Tana MCP is not available".** Claude can't reach any Tana server: run `/mcp` and check that `tana` is connected, then start Claude again in your ILOS folder.
- **Errors such as "transport already connected".** ILOS sends Tana one request at a time. If another Tana tool (for example a voice-note agent) runs at the same moment, wait a minute and try again.
- **You changed servers (local ↔ remote).** Nothing else changes: your IDs in `SYSTEM/tana-ids.yaml` are the same on both servers.

## Verified

- macOS, 2026-11-06: both addresses answer and ask for sign-in; the local server lists workspaces from Claude Code.
- macOS, 2026-11-07: remote server added with `claude mcp add` and signed in through `/mcp`; it lists workspaces from Claude Code. It lists every workspace the account can reach (more than the local server, some without a name); the workspaces both servers list have the same IDs.
- Not yet verified: Windows; Claude Cowork / claude.ai connector steps (taken from Tana's documentation).

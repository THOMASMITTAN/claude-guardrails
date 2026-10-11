# guardrails

A Claude Code mod that blocks destructive commands and edits to secret files, in the main session and every subagent, with a toast saying why.

## What it blocks

- `rm -rf` in any spelling (`-fr`, `-r -f`, `-Rf`, `--recursive --force`)
- Force-push (`git push --force`, `-f`, `+branch`); `--force-with-lease` is allowed
- `git reset --hard` and `git clean -f`
- Writing, editing, moving or deleting `.env*`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, SSH keys, `.npmrc`, `.netrc` and `credentials` files

Reading those files, ordinary `rm`, and a normal push are still allowed. If the check itself fails, the call is blocked rather than let through.

Shell checks look at the whole command text, so a command that merely *mentions* a blocked pattern (for example inside a heredoc) is blocked too. Use the Write tool for such text.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install guardrails --marketplace THOMASMITTAN/claude-guardrails
```

Answer `y` to add the marketplace, then choose the **user** scope so it runs in every project.

## Change the rules

Edit `hooks/rules.ts`, bump `version` in `.claude-plugin/plugin.json`, push, then run `claude plugin update guardrails` and `/reload-plugins`.

Tests: `claude plugin test .`

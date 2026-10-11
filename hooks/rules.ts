// Each rule returns a reason when the call should be blocked.

const SECRET_FILE =
  /(^|[\/\s'"=])(\.env(\.[\w.-]+)?|[\w.-]+\.(pem|key|p12|pfx)|id_(rsa|dsa|ecdsa|ed25519)|\.npmrc|\.netrc|credentials(\.json)?)(?=$|[\s'";|&)])/

const BASH_RULES: Array<[RegExp, string]> = [
  [/\bgit\s+push\b.*(\s--force(?!-with-lease)\b|\s-f\b|\s\+\S+)/, 'force-push rewrites remote history (use --force-with-lease if you must)'],
  [/\bgit\s+reset\s+.*--hard\b|\bgit\s+reset\s+--hard\b/, 'git reset --hard throws away uncommitted work'],
  [/\bgit\s+clean\s+-[a-zA-Z]*f/, 'git clean -f deletes untracked files'],
]

const SECRET_WRITE = /(>{1,2}|\btee\b|\bsed\s+-i|\brm\b|\bmv\b|\bcp\b|\btruncate\b|\bchmod\b)/

// rm with both a recursive and a force flag, in any order or spelling.
function isForcedRecursiveRm(command: string): boolean {
  for (const m of command.matchAll(/\brm((?:\s+-{1,2}[\w-]+)+)/g)) {
    const flags = m[1] ?? ''
    const recursive = /\s--recursive\b|\s-[a-zA-Z]*[rR]/.test(flags)
    const force = /\s--force\b|\s-[a-zA-Z]*f/.test(flags)
    if (recursive && force) return true
  }
  return false
}

export function checkBash(command: string): string | undefined {
  if (isForcedRecursiveRm(command)) return 'rm -rf deletes files permanently'
  for (const [pattern, reason] of BASH_RULES) {
    if (pattern.test(command)) return reason
  }
  if (SECRET_WRITE.test(command) && SECRET_FILE.test(command)) {
    return 'this command changes a secrets file (.env, keys or credentials)'
  }
  return undefined
}

export function checkPath(path: string): string | undefined {
  return SECRET_FILE.test(path) ? `${path} is a secrets file (.env, keys or credentials)` : undefined
}

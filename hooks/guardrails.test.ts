import { test, expect, describe } from 'claude-code/testing'
import { checkBash, checkPath } from './rules'

describe('rules', () => {
  test('blocks destructive shell commands', async () => {
    for (const cmd of [
      'rm -rf build', 'rm -fr /', 'rm -r -f dist', 'sudo rm -Rf ~/x',
      'git push --force origin main', 'git push -f', 'git push origin +main',
      'git reset --hard HEAD~1', 'git clean -fd',
      'echo SECRET=1 > .env', 'sed -i s/a/b/ .env.local', 'rm id_rsa', 'cp x server.pem',
    ]) expect(checkBash(cmd)).toBeDefined()
  })

  test('allows everyday commands', async () => {
    for (const cmd of [
      'ls -la', 'rm notes.txt', 'rm -r old', 'git push origin main', 'git push --force-with-lease',
      'git reset HEAD file.ts', 'npm test', 'cat .env', 'grep KEY .env.example | wc -l', 'echo hi > out.txt',
    ]) expect(checkBash(cmd)).toBeUndefined()
  })

  test('protects secret file paths', async () => {
    for (const p of ['/app/.env', '/app/.env.production', '/k/server.key', '/home/me/.ssh/id_ed25519', '/x/credentials.json'])
      expect(checkPath(p)).toBeDefined()
    for (const p of ['/app/src/index.ts', '/app/environment.ts', '/app/keys.ts', '/app/README.md'])
      expect(checkPath(p)).toBeUndefined()
  })
})

test('hook denies a blocked call and passes a safe one through', async ($, on) => {
  on('tool.call', () => ({ deny: 'REACHED_ENGINE' }))

  const blocked = await $.tool.call({ tool: 'Bash', command: 'rm -rf build' })
  expect(JSON.stringify(blocked)).toContain('guardrails: blocked')

  const safe = await $.tool.call({ tool: 'Bash', command: 'ls' })
  expect(JSON.stringify(safe)).toContain('REACHED_ENGINE')

  const env = await $.tool.call({ tool: 'Write', file_path: '/app/.env', content: 'X=1' })
  expect(JSON.stringify(env)).toContain('secrets file')
})

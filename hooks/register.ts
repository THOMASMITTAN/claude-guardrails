import type { EngineInterface, Register } from 'claude-code'
import { checkBash, checkPath } from './rules'

function block($: EngineInterface, reason: string) {
  $.ui.toast(`🛡 Blocked: ${reason}`)
  return { deny: `${$.plugin.name}: blocked because ${reason}. Ask the user to run it themselves if it is really needed.` }
}

function failClosed($: EngineInterface) {
  return { deny: `${$.plugin.name}: its check failed, so the call was blocked.` }
}

export const register: Register = on => {
  on('tool.call', { tool: 'Bash' }, ($, e, next) => {
    const reason = checkBash(e.command)
    return reason ? block($, reason) : next(e)
  }).catch(($, e, next) => (next.called ? next(e) : failClosed($)))

  on('tool.call', { tool: 'Edit' }, ($, e, next) => {
    const reason = checkPath(e.file_path)
    return reason ? block($, reason) : next(e)
  }).catch(($, e, next) => (next.called ? next(e) : failClosed($)))

  on('tool.call', { tool: 'Write' }, ($, e, next) => {
    const reason = checkPath(e.file_path)
    return reason ? block($, reason) : next(e)
  }).catch(($, e, next) => (next.called ? next(e) : failClosed($)))

  on('tool.call', { tool: 'NotebookEdit' }, ($, e, next) => {
    const reason = checkPath(e.notebook_path)
    return reason ? block($, reason) : next(e)
  }).catch(($, e, next) => (next.called ? next(e) : failClosed($)))
}

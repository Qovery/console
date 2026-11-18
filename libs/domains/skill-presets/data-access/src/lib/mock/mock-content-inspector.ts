import { type SkillPresetFinding } from '../skill-presets.types'

/**
 * A partial port of q-core's `SkillPresetContentInspector`, for the mock only, so the Console can
 * exercise the 422 flow without the backend. q-core stays the only gate: never use this to decide
 * whether content is safe.
 */

interface Rule {
  id: string
  reason: string
  pattern: RegExp
}

// Zero-width and bidirectional override characters, written as escapes so the source stays readable.
const INVISIBLE_CHARACTERS = ['[', '\\u200B-\\u200F', '\\u202A-\\u202E', '\\u2066-\\u2069', ']'].join('')

const rule = (id: string, reason: string, pattern: string, flags = 'i'): Rule => ({
  id,
  reason,
  pattern: new RegExp(pattern, flags),
})

const ALLOWED_HOSTS = [
  'qovery.com',
  'github.com/qovery',
  'kubernetes.io',
  'docs.aws.amazon.com',
  'cloud.google.com',
  'learn.microsoft.com',
  'docs.docker.com',
  'agentskills.io',
]

const URL_REGEX = /\bhttps?:\/\/[^\s)>\]"'`]+/gi

const RULES: Rule[] = [
  rule(
    'override-instructions',
    "Tries to override the agent's instructions",
    String.raw`\b(ignore|disregard|forget|override)\b[^.\n]{0,40}\b(previous|prior|above|earlier|system|all)\b[^.\n]{0,20}\b(instructions?|prompts?|rules?|guidelines?)`
  ),
  rule(
    'role-hijack',
    'Tries to give the agent a new identity',
    String.raw`\byou are now\b|\bact as (an? )?(unrestricted|jailbroken|dan)\b|\bdeveloper mode\b`
  ),
  rule(
    'conceal-from-user',
    'Asks the agent to hide something from the user',
    String.raw`\b(do not|don't|never|must not)\s+(tell|inform|show|mention|notify|alert|reveal)\b[^.\n]{0,15}\b(user|developer|human)\b|\bhide\b[^.\n]{0,30}\bfrom (the )?(user|developer|human)\b`
  ),
  rule(
    'conceal-silently',
    'Asks the agent to act silently',
    String.raw`\b(silently|secretly|covertly)\b[^.\n]{0,40}\b(run|send|upload|post|execute|copy|read|fetch)\b`
  ),
  rule(
    'skip-confirmation',
    "Asks the agent to bypass the user's approval",
    String.raw`\b(skip|bypass|disable)\b[^.\n]{0,20}\b(confirmation|approval|permission prompts?)\b|--dangerously|bypassPermissions|--yolo\b`
  ),
  rule(
    'read-credentials',
    'Points the agent at local credential stores',
    String.raw`~/\.ssh\b|\bid_(rsa|ed25519|ecdsa)\b|~/\.aws/credentials|~/\.config/gcloud|~/\.azure\b|~/\.docker/config\.json|~/\.netrc|~/\.npmrc|~/\.git-credentials|~/\.kube/config|~/\.config/qovery`
  ),
  rule(
    'dump-secrets',
    'Asks the agent to print or collect secrets',
    String.raw`\b(printenv|env\s*\|)|\bgh auth token\b|\bqovery auth token\b|\baws configure export-credentials\b|\bgcloud auth print-access-token\b|\bkubectl get secrets?\b[^\n]{0,40}-o\s*(json|yaml)`
  ),
  rule(
    'exfiltration-endpoint',
    'Mentions a request-capture service',
    String.raw`webhook\.site|requestbin|pipedream\.net|ngrok\.(io|app)|interact\.sh|burpcollaborator|oast\.(fun|pro|live)`
  ),
  rule(
    'upload-command',
    'Sends local data over the network',
    String.raw`\bcurl\b[^\n]{0,80}\s(-d|--data[a-z-]*|-F|--form|-T|--upload-file)\b|\bwget\b[^\n]{0,80}--post-(data|file)|\bscp\b\s`
  ),
  rule(
    'remote-exec',
    'Pipes downloaded code into a shell',
    String.raw`\b(curl|wget)\b[^\n|]{0,120}\|\s*(sudo\s+)?(ba|z)?sh\b|\biex\s*\(`
  ),
  rule('html-comment', 'Contains an HTML comment, which renders invisibly', '<!--'),
  rule('invisible-characters', 'Contains characters a reviewer cannot see', INVISIBLE_CHARACTERS, 'u'),
  rule('encoded-blob', 'Contains a long encoded blob', String.raw`[A-Za-z0-9+/=]{120,}`, ''),
  rule(
    'credential',
    'Contains what looks like a credential',
    String.raw`\b(qov_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|glpat-[A-Za-z0-9_-]{20}|sk-[A-Za-z0-9]{20,})|-----BEGIN [A-Z ]*PRIVATE KEY-----`,
    ''
  ),
]

/** Attacks when they describe what to do, protections when negated in the same sentence. */
const WITHOUT_RULES: Rule[] = [
  rule(
    'conceal-from-user',
    'Asks the agent to hide something from the user',
    String.raw`\bwithout (telling|informing|notifying|alerting|showing)\b[^.\n]{0,10}\b(the )?(user|developer|human|anyone)\b`
  ),
  rule(
    'skip-confirmation',
    "Asks the agent to bypass the user's approval",
    String.raw`\bwithout (asking|waiting)\b[^.\n]{0,25}\b(user|confirmation|approval|permission)\b`
  ),
]

const NEGATION = /\b(never|don't|do not|must not|mustn't|cannot|can't|not allowed to)\b/i

const hostAndPathOf = (url: string) => url.replace(/^https?:\/\//i, '').toLowerCase()

function isAllowedUrl(url: string) {
  if (/[$<]|\{\{/.test(url)) return false
  const hostAndPath = hostAndPathOf(url)
  const host = hostAndPath.split(/[/?#:]/)[0]
  return ALLOWED_HOSTS.some((allowed) =>
    allowed.includes('/')
      ? hostAndPath === allowed || hostAndPath.startsWith(`${allowed}/`)
      : host === allowed || host.endsWith(`.${allowed}`)
  )
}

export interface InspectedField {
  location: string
  text: string
}

export function inspectSkillPresetContent(fields: InspectedField[]): SkillPresetFinding[] {
  const findings: SkillPresetFinding[] = []

  for (const { location, text } of fields) {
    text.split('\n').forEach((lineText, index) => {
      const line = index + 1
      const seen = new Set<string>()
      const add = (ruleId: string, reason: string) => {
        if (seen.has(ruleId)) return
        seen.add(ruleId)
        findings.push({ source: 'RULES', rule_id: ruleId, location, line, reason })
      }

      RULES.filter(({ pattern }) => pattern.test(lineText)).forEach(({ id, reason }) => add(id, reason))

      WITHOUT_RULES.forEach(({ id, reason, pattern }) => {
        const match = pattern.exec(lineText)
        if (!match) return
        const sentenceBefore = lineText.slice(0, match.index).split('.').pop() ?? ''
        if (!NEGATION.test(sentenceBefore)) add(id, reason)
      })

      for (const [url] of lineText.matchAll(URL_REGEX)) {
        if (!isAllowedUrl(url)) {
          add('external-url', `Links to ${hostAndPathOf(url).split(/[/?#]/)[0]}, which is not an allowed host`)
        }
      }
    })
  }

  return findings
}

import {
  AgenticWorkflowWebhookAuthMode,
  type AgenticWorkflowWebhookAuthRequest,
  type AgenticWorkflowWebhookAuthResponse,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'

export const DEFAULT_WEBHOOK_AUTH_HEADER_NAME = 'x-qovery-webhook-secret'
export const WEBHOOK_AUTH_SECRET_MIN_LENGTH = 16
export const WEBHOOK_AUTH_SECRET_MAX_LENGTH = 1024
export const WEBHOOK_AUTH_HEADER_NAME_MAX_LENGTH = 128

// Only these modes can be selected for now: the provider modes are rejected by the API until they are verified.
export const SELECTABLE_WEBHOOK_AUTH_MODES: AgenticWorkflowWebhookAuthMode[] = [
  AgenticWorkflowWebhookAuthMode.NONE,
  AgenticWorkflowWebhookAuthMode.SECRET_HEADER,
]

// Printable ASCII, no leading or trailing space.
const SECRET_PATTERN = /^[\x21-\x7E](?:[\x20-\x7E]*[\x21-\x7E])?$/
// RFC 9110 token.
const HEADER_NAME_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/

export interface AgenticWorkflowWebhookAuthFormValues {
  webhookAuthMode: AgenticWorkflowWebhookAuthMode
  webhookAuthHeaderName: string
  webhookAuthSecret: string
}

export function getWebhookAuthModeLabel(mode: AgenticWorkflowWebhookAuthMode) {
  return match(mode)
    .with(AgenticWorkflowWebhookAuthMode.NONE, () => 'None')
    .with(AgenticWorkflowWebhookAuthMode.SECRET_HEADER, () => 'Secret header')
    .with(AgenticWorkflowWebhookAuthMode.LINEAR, () => 'Linear signature')
    .with(AgenticWorkflowWebhookAuthMode.SENTRY, () => 'Sentry signature')
    .with(AgenticWorkflowWebhookAuthMode.INCIDENT_IO, () => 'incident.io signature')
    .exhaustive()
}

export function validateWebhookAuthSecret(
  secret: string,
  mode: AgenticWorkflowWebhookAuthMode,
  savedMode: AgenticWorkflowWebhookAuthMode | undefined
): string | true {
  if (mode !== AgenticWorkflowWebhookAuthMode.SECRET_HEADER) return true
  // A blank secret keeps the stored one, which only exists once the mode is saved.
  if (!secret) return savedMode === AgenticWorkflowWebhookAuthMode.SECRET_HEADER ? true : 'Enter a secret.'
  if (secret.length < WEBHOOK_AUTH_SECRET_MIN_LENGTH || secret.length > WEBHOOK_AUTH_SECRET_MAX_LENGTH)
    return `The secret must be ${WEBHOOK_AUTH_SECRET_MIN_LENGTH} to ${WEBHOOK_AUTH_SECRET_MAX_LENGTH} characters.`
  if (!SECRET_PATTERN.test(secret)) return 'Use printable ASCII characters only, without leading or trailing spaces.'
  return true
}

export function validateWebhookAuthHeaderName(headerName: string): string | true {
  const value = headerName.trim()
  if (!value) return true
  if (value.length > WEBHOOK_AUTH_HEADER_NAME_MAX_LENGTH)
    return `The header name must be at most ${WEBHOOK_AUTH_HEADER_NAME_MAX_LENGTH} characters.`
  if (!HEADER_NAME_PATTERN.test(value)) return 'Enter a valid HTTP header name.'
  return true
}

export function isWebhookAuthValid(
  values: AgenticWorkflowWebhookAuthFormValues,
  savedMode: AgenticWorkflowWebhookAuthMode | undefined
) {
  if (values.webhookAuthMode !== AgenticWorkflowWebhookAuthMode.SECRET_HEADER) return true
  return (
    validateWebhookAuthSecret(values.webhookAuthSecret, values.webhookAuthMode, savedMode) === true &&
    validateWebhookAuthHeaderName(values.webhookAuthHeaderName) === true
  )
}

// Returns undefined when nothing changed: the API then keeps the stored configuration,
// so saving another settings page never re-sends the mode.
export function formatAgenticWorkflowWebhookAuth(
  values: AgenticWorkflowWebhookAuthFormValues,
  saved: AgenticWorkflowWebhookAuthResponse | undefined
): AgenticWorkflowWebhookAuthRequest | undefined {
  const mode = values.webhookAuthMode
  const savedMode = saved?.mode ?? AgenticWorkflowWebhookAuthMode.NONE

  if (mode !== AgenticWorkflowWebhookAuthMode.SECRET_HEADER) {
    return mode === savedMode ? undefined : { mode }
  }

  const secret = values.webhookAuthSecret
  // The API keeps the stored name when it receives a blank one, so send the default explicitly
  // to let an emptied field restore it.
  const headerName = values.webhookAuthHeaderName.trim() || DEFAULT_WEBHOOK_AUTH_HEADER_NAME
  const headerNameChanged = headerName.toLowerCase() !== saved?.header_name?.toLowerCase()

  if (mode === savedMode && !secret && !headerNameChanged) return undefined

  return {
    mode,
    ...(secret ? { secret } : {}),
    header_name: headerName,
  }
}

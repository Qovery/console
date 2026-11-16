import { AgenticWorkflowWebhookAuthMode } from 'qovery-typescript-axios'
import {
  formatAgenticWorkflowWebhookAuth,
  validateWebhookAuthHeaderName,
  validateWebhookAuthSecret,
} from './agentic-workflow-webhook-auth'

const { NONE, SECRET_HEADER, LINEAR } = AgenticWorkflowWebhookAuthMode
const SECRET = 'a-valid-secret-value'

describe('validateWebhookAuthSecret', () => {
  it('requires a secret when entering the secret header mode', () => {
    expect(validateWebhookAuthSecret('', SECRET_HEADER, NONE)).toBe('Enter a secret.')
    expect(validateWebhookAuthSecret('', SECRET_HEADER, undefined)).toBe('Enter a secret.')
  })

  it('keeps the stored secret when already in the secret header mode', () => {
    expect(validateWebhookAuthSecret('', SECRET_HEADER, SECRET_HEADER)).toBe(true)
  })

  it.each([
    ['too-short', 'The secret must be 16 to 1024 characters.'],
    ['x'.repeat(1025), 'The secret must be 16 to 1024 characters.'],
    [' leading-space-secret', 'Use printable ASCII characters only, without leading or trailing spaces.'],
    ['trailing-space-secret ', 'Use printable ASCII characters only, without leading or trailing spaces.'],
    ['non-ascii-secret-é-value', 'Use printable ASCII characters only, without leading or trailing spaces.'],
  ])('rejects %s', (secret, error) => {
    expect(validateWebhookAuthSecret(secret, SECRET_HEADER, NONE)).toBe(error)
  })

  it('accepts a secret with inner spaces', () => {
    expect(validateWebhookAuthSecret('a secret with spaces', SECRET_HEADER, NONE)).toBe(true)
  })

  it('ignores the secret for the none mode', () => {
    expect(validateWebhookAuthSecret('', NONE, SECRET_HEADER)).toBe(true)
  })
})

describe('validateWebhookAuthHeaderName', () => {
  it.each(['', 'x-custom-secret', ' X-Custom-Secret '])('accepts %p', (value) => {
    expect(validateWebhookAuthHeaderName(value)).toBe(true)
  })

  it('rejects an invalid header name', () => {
    expect(validateWebhookAuthHeaderName('x custom')).toBe('Enter a valid HTTP header name.')
    expect(validateWebhookAuthHeaderName('x'.repeat(129))).toBe('The header name must be at most 128 characters.')
  })
})

describe('formatAgenticWorkflowWebhookAuth', () => {
  const values = { webhookAuthMode: NONE, webhookAuthHeaderName: '', webhookAuthSecret: '' }

  it('omits an unchanged configuration', () => {
    expect(formatAgenticWorkflowWebhookAuth(values, { mode: NONE, header_name: null })).toBeUndefined()
    expect(
      formatAgenticWorkflowWebhookAuth(
        { webhookAuthMode: SECRET_HEADER, webhookAuthHeaderName: 'x-custom', webhookAuthSecret: '' },
        { mode: SECRET_HEADER, header_name: 'x-custom' }
      )
    ).toBeUndefined()
  })

  it('omits an unchanged provider mode', () => {
    expect(
      formatAgenticWorkflowWebhookAuth({ ...values, webhookAuthMode: LINEAR }, { mode: LINEAR, header_name: null })
    ).toBeUndefined()
  })

  it('sends the secret and header name when entering the secret header mode', () => {
    expect(
      formatAgenticWorkflowWebhookAuth(
        { webhookAuthMode: SECRET_HEADER, webhookAuthHeaderName: ' X-Custom ', webhookAuthSecret: SECRET },
        { mode: NONE, header_name: null }
      )
    ).toEqual({ mode: SECRET_HEADER, secret: SECRET, header_name: 'X-Custom' })
  })

  it('sends the default header name when the field is empty', () => {
    expect(
      formatAgenticWorkflowWebhookAuth(
        { webhookAuthMode: SECRET_HEADER, webhookAuthHeaderName: '', webhookAuthSecret: SECRET },
        undefined
      )
    ).toEqual({ mode: SECRET_HEADER, secret: SECRET, header_name: 'x-qovery-webhook-secret' })
  })

  it('restores the default header name when a custom one is cleared', () => {
    expect(
      formatAgenticWorkflowWebhookAuth(
        { webhookAuthMode: SECRET_HEADER, webhookAuthHeaderName: '', webhookAuthSecret: '' },
        { mode: SECRET_HEADER, header_name: 'x-custom' }
      )
    ).toEqual({ mode: SECRET_HEADER, header_name: 'x-qovery-webhook-secret' })
  })

  it('omits an unchanged default header name', () => {
    expect(
      formatAgenticWorkflowWebhookAuth(
        { webhookAuthMode: SECRET_HEADER, webhookAuthHeaderName: '', webhookAuthSecret: '' },
        { mode: SECRET_HEADER, header_name: 'x-qovery-webhook-secret' }
      )
    ).toBeUndefined()
  })

  it('renames the header without sending a secret', () => {
    expect(
      formatAgenticWorkflowWebhookAuth(
        { webhookAuthMode: SECRET_HEADER, webhookAuthHeaderName: 'x-renamed', webhookAuthSecret: '' },
        { mode: SECRET_HEADER, header_name: 'x-custom' }
      )
    ).toEqual({ mode: SECRET_HEADER, header_name: 'x-renamed' })
  })

  it('switches back to none without a secret', () => {
    expect(
      formatAgenticWorkflowWebhookAuth(
        { webhookAuthMode: NONE, webhookAuthHeaderName: 'x-custom', webhookAuthSecret: SECRET },
        { mode: SECRET_HEADER, header_name: 'x-custom' }
      )
    ).toEqual({ mode: NONE })
  })
})

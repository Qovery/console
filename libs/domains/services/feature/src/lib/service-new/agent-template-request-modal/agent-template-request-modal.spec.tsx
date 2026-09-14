import posthog from 'posthog-js'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { AgentTemplateRequestModal } from './agent-template-request-modal'

jest.mock('posthog-js', () => ({
  capture: jest.fn(),
}))

describe('AgentTemplateRequestModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should reject a whitespace-only request', async () => {
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(<AgentTemplateRequestModal organizationId="org-1" onClose={onClose} />)

    await userEvent.type(screen.getByLabelText('Which template is missing?'), '   ')

    await waitFor(() => expect(screen.getByRole('button', { name: 'Send request' })).toBeDisabled())
    expect(posthog.capture).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should submit the requested template', async () => {
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(<AgentTemplateRequestModal organizationId="org-1" onClose={onClose} />)

    expect(screen.getByRole('button', { name: 'Send request' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Which template is missing?'), '  Code review agent  ')
    await userEvent.click(screen.getByRole('button', { name: 'Send request' }))

    await waitFor(() => {
      expect(posthog.capture).toHaveBeenCalledWith('agent-template-request-feedback', {
        message: 'Code review agent',
        organization_id: 'org-1',
      })
      expect(onClose).toHaveBeenCalled()
    })
  })
})

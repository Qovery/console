import selectEvent from 'react-select-event'
import * as organizationDomain from '@qovery/domains/organizations/feature'
import { webhookFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import WebhookCrudModalFeature, {
  SECRET_VALUE_UNCHANGED,
  type WebhookCrudModalFeatureProps,
} from './webhook-crud-modal-feature'

const mockWebhook = webhookFactoryMock(1)[0]
const mockWebhookWithSecret = { ...mockWebhook, target_secret_set: true }
const props: WebhookCrudModalFeatureProps = {
  closeModal: jest.fn(),
  organizationId: '000-000-000',
  webhook: undefined,
}

const useEditWebhooksMockSpy = jest.spyOn(organizationDomain, 'useEditWebhook') as jest.Mock
const useCreateWebhookMockSpy = jest.spyOn(organizationDomain, 'useCreateWebhook') as jest.Mock

describe('WebhookCrudModalFeature', () => {
  beforeEach(() => {
    useEditWebhooksMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useCreateWebhookMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<WebhookCrudModalFeature {...props} webhook={mockWebhook} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render all the inputs', () => {
    renderWithProviders(<WebhookCrudModalFeature {...props} webhook={mockWebhook} />)

    screen.getByLabelText('URL')
    screen.getByLabelText('Kind')
    screen.getByLabelText('Description')
    screen.getByLabelText('Secret')
    screen.getByLabelText('Events')
    screen.getByTestId('project-filter-input')
    screen.getByLabelText('Environment type filter')
  })

  it('should mutate useCreateWebhook', async () => {
    const { userEvent } = renderWithProviders(<WebhookCrudModalFeature {...props} />)

    const url = screen.getByLabelText('URL')
    const kind = screen.getByLabelText('Kind')
    const description = screen.getByLabelText('Description')
    const secret = screen.getByLabelText('Secret')
    const events = screen.getByLabelText('Events')
    const tags = screen.getByTestId('input-tags-field')
    const envType = screen.getByLabelText('Environment type filter')

    await userEvent.type(url, 'https://test.com')

    await selectEvent.select(kind, ['Standard'], {
      container: document.body,
    })

    await userEvent.type(description, 'description')
    await userEvent.type(secret, 'secret')

    await selectEvent.select(events, ['DEPLOYMENT_STARTED'], {
      container: document.body,
    })

    await userEvent.type(tags, 'test')
    await userEvent.keyboard('{enter}')

    await selectEvent.select(envType, ['STAGING'], {
      container: document.body,
    })

    const button = screen.getByTestId('submit-button')
    expect(button).toBeEnabled()

    await userEvent.click(button)

    expect(useCreateWebhookMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '000-000-000',
      webhookRequest: {
        target_url: 'https://test.com',
        kind: 'STANDARD',
        description: 'description',
        target_secret: 'secret',
        events: ['DEPLOYMENT_STARTED'],
        project_names_filter: ['test'],
        environment_types_filter: ['STAGING'],
      },
    })
  })

  it('should mutate useEditWebhook', async () => {
    const { userEvent } = renderWithProviders(<WebhookCrudModalFeature {...props} webhook={mockWebhook} />)
    const url = screen.getByLabelText('URL')
    const kind = screen.getByLabelText('Kind')
    const description = screen.getByLabelText('Description')
    const secret = screen.getByLabelText('Secret')
    const tags = screen.getByTestId('input-tags-field')
    const envType = screen.getByLabelText('Environment type filter')

    await userEvent.clear(url)
    await userEvent.type(url, 'https://test.com')

    await selectEvent.select(kind, ['Standard'], {
      container: document.body,
    })

    await userEvent.clear(description)
    await userEvent.type(description, 'description')
    await userEvent.type(secret, 'secret')

    await userEvent.type(tags, 'test')
    await userEvent.keyboard('{enter}')

    await selectEvent.select(envType, ['STAGING'], {
      container: document.body,
    })

    const button = screen.getByTestId('submit-button')
    expect(button).toBeEnabled()

    await userEvent.click(button)

    expect(useEditWebhooksMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '000-000-000',
      webhookId: mockWebhook.id,
      webhookRequest: {
        ...mockWebhook,
        target_url: 'https://test.com',
        kind: 'STANDARD',
        description: 'description',
        target_secret: 'secret',
        events: mockWebhook.events,
        project_names_filter: ['test'],
        environment_types_filter: [...(mockWebhook.environment_types_filter || []), 'STAGING'],
      },
    })
  })

  it('should trim URL with trailing whitespace on create', async () => {
    const { userEvent } = renderWithProviders(<WebhookCrudModalFeature {...props} />)

    const url = screen.getByLabelText('URL')
    const kind = screen.getByLabelText('Kind')
    const events = screen.getByLabelText('Events')

    // Type URL with trailing whitespace
    await userEvent.type(url, 'https://test.com   ')

    await selectEvent.select(kind, ['Standard'], {
      container: document.body,
    })

    await selectEvent.select(events, ['DEPLOYMENT_STARTED'], {
      container: document.body,
    })

    const button = screen.getByTestId('submit-button')
    await userEvent.click(button)

    expect(useCreateWebhookMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '000-000-000',
      webhookRequest: expect.objectContaining({
        target_url: 'https://test.com',
      }),
    })
  })

  it('should trim URL with leading whitespace on create', async () => {
    const { userEvent } = renderWithProviders(<WebhookCrudModalFeature {...props} />)

    const url = screen.getByLabelText('URL')
    const kind = screen.getByLabelText('Kind')
    const events = screen.getByLabelText('Events')

    // Type URL with leading whitespace
    await userEvent.type(url, '   https://test.com')

    await selectEvent.select(kind, ['Standard'], {
      container: document.body,
    })

    await selectEvent.select(events, ['DEPLOYMENT_STARTED'], {
      container: document.body,
    })

    const button = screen.getByTestId('submit-button')
    await userEvent.click(button)

    expect(useCreateWebhookMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '000-000-000',
      webhookRequest: expect.objectContaining({
        target_url: 'https://test.com',
      }),
    })
  })

  it('should trim URL with whitespace on edit', async () => {
    const { userEvent } = renderWithProviders(<WebhookCrudModalFeature {...props} webhook={mockWebhook} />)

    const url = screen.getByLabelText('URL')

    await userEvent.clear(url)
    // Type URL with both leading and trailing whitespace
    await userEvent.type(url, '  https://updated.com  ')

    const button = screen.getByTestId('submit-button')
    await userEvent.click(button)

    expect(useEditWebhooksMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '000-000-000',
      webhookId: mockWebhook.id,
      webhookRequest: expect.objectContaining({
        target_url: 'https://updated.com',
      }),
    })
  })

  describe('secret field handling', () => {
    it('should send SECRET_VALUE_UNCHANGED when editing webhook with existing secret and secret not modified', async () => {
      const { userEvent } = renderWithProviders(<WebhookCrudModalFeature {...props} webhook={mockWebhookWithSecret} />)

      const description = screen.getByLabelText('Description')
      await userEvent.clear(description)
      await userEvent.type(description, 'updated description')

      const button = screen.getByTestId('submit-button')
      await userEvent.click(button)

      expect(useEditWebhooksMockSpy().mutateAsync).toHaveBeenCalledWith({
        organizationId: '000-000-000',
        webhookId: mockWebhookWithSecret.id,
        webhookRequest: expect.objectContaining({
          target_secret: SECRET_VALUE_UNCHANGED,
        }),
      })
    })

    it('should send empty string when editing webhook with existing secret and user types in secret field', async () => {
      const { userEvent } = renderWithProviders(<WebhookCrudModalFeature {...props} webhook={mockWebhookWithSecret} />)

      const secret = screen.getByLabelText('Secret')
      await userEvent.type(secret, 'x')
      await userEvent.clear(secret)

      const button = screen.getByTestId('submit-button')
      await userEvent.click(button)

      expect(useEditWebhooksMockSpy().mutateAsync).toHaveBeenCalledWith({
        organizationId: '000-000-000',
        webhookId: mockWebhookWithSecret.id,
        webhookRequest: expect.objectContaining({
          target_secret: '',
        }),
      })
    })

    it('should send new secret value when editing webhook and user enters new secret', async () => {
      const { userEvent } = renderWithProviders(<WebhookCrudModalFeature {...props} webhook={mockWebhookWithSecret} />)

      const secret = screen.getByLabelText('Secret')
      await userEvent.type(secret, 'new-secret-value')

      const button = screen.getByTestId('submit-button')
      await userEvent.click(button)

      expect(useEditWebhooksMockSpy().mutateAsync).toHaveBeenCalledWith({
        organizationId: '000-000-000',
        webhookId: mockWebhookWithSecret.id,
        webhookRequest: expect.objectContaining({
          target_secret: 'new-secret-value',
        }),
      })
    })

    it('should display password type input for secret field', () => {
      renderWithProviders(<WebhookCrudModalFeature {...props} webhook={mockWebhookWithSecret} />)

      const secret = screen.getByLabelText('Secret')
      expect(secret).toHaveAttribute('type', 'password')
    })

    it('should show warning when user clears the secret field on webhook with existing secret', async () => {
      const { userEvent } = renderWithProviders(<WebhookCrudModalFeature {...props} webhook={mockWebhookWithSecret} />)

      const secret = screen.getByLabelText('Secret')
      await userEvent.type(secret, 'some-value')
      expect(screen.queryByText(/will remove the existing secret/i)).not.toBeInTheDocument()

      await userEvent.clear(secret)
      expect(screen.getByText(/will remove the existing secret/i)).toBeInTheDocument()
    })

    it('should not show warning when webhook has no existing secret', async () => {
      const { userEvent } = renderWithProviders(<WebhookCrudModalFeature {...props} webhook={mockWebhook} />)

      const secret = screen.getByLabelText('Secret')
      await userEvent.type(secret, 'some-value')
      await userEvent.clear(secret)

      expect(screen.queryByText(/will remove the existing secret/i)).not.toBeInTheDocument()
    })
  })
})

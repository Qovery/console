import selectEvent from 'react-select-event'
import { webhookFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useCreateWebhookHook from '../../hooks/use-create-webhook/use-create-webhook'
import * as useEditWebhookHook from '../../hooks/use-edit-webhook/use-edit-webhook'
import WebhookCrudModal, { type WebhookCrudModalFeatureProps } from './webhook-crud-modal'

const mockWebhook = webhookFactoryMock(1)[0]
const mockWebhookWithSecret = { ...mockWebhook, target_secret_set: true }
const props: WebhookCrudModalFeatureProps = {
  closeModal: jest.fn(),
  organizationId: '000-000-000',
  webhook: undefined,
}

const useEditWebhookMockSpy = jest.spyOn(useEditWebhookHook, 'useEditWebhook') as jest.Mock
const useCreateWebhookMockSpy = jest.spyOn(useCreateWebhookHook, 'useCreateWebhook') as jest.Mock

describe('WebhookCrudModal', () => {
  let createWebhookMock: jest.Mock
  let editWebhookMock: jest.Mock

  beforeEach(() => {
    createWebhookMock = jest.fn().mockResolvedValue(undefined)
    editWebhookMock = jest.fn().mockResolvedValue(undefined)
    useEditWebhookMockSpy.mockReturnValue({
      mutateAsync: editWebhookMock,
      isLoading: false,
    })
    useCreateWebhookMockSpy.mockReturnValue({
      mutateAsync: createWebhookMock,
      isLoading: false,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<WebhookCrudModal {...props} webhook={mockWebhook} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render all the inputs when creating', () => {
    renderWithProviders(<WebhookCrudModal {...props} />)

    screen.getByLabelText('URL')
    screen.getByLabelText('Kind')
    screen.getByLabelText('Description')
    screen.getByLabelText('Secret')
    screen.getByLabelText('Events')
    screen.getByTestId('project-filter-input')
    screen.getByLabelText('Environment type filter')
  })

  it('should not show secret field when editing (before form is dirty)', () => {
    renderWithProviders(<WebhookCrudModal {...props} webhook={mockWebhook} />)

    screen.getByLabelText('URL')
    screen.getByLabelText('Kind')
    screen.getByLabelText('Description')
    expect(screen.queryByLabelText('Secret')).not.toBeInTheDocument()
    screen.getByLabelText('Events')
  })

  it('should mutate useCreateWebhook', async () => {
    const { userEvent } = renderWithProviders(<WebhookCrudModal {...props} />)

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

    expect(createWebhookMock).toHaveBeenCalledWith({
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

  it('should mutate useEditWebhook (webhook without existing secret)', async () => {
    const { userEvent } = renderWithProviders(<WebhookCrudModal {...props} webhook={mockWebhook} />)
    const url = screen.getByLabelText('URL')
    const kind = screen.getByLabelText('Kind')
    const description = screen.getByLabelText('Description')
    const tags = screen.getByTestId('input-tags-field')
    const envType = screen.getByLabelText('Environment type filter')

    await userEvent.clear(url)
    await userEvent.type(url, 'https://test.com')

    await selectEvent.select(kind, ['Standard'], {
      container: document.body,
    })

    await userEvent.clear(description)
    await userEvent.type(description, 'description')

    await userEvent.type(tags, 'test')
    await userEvent.keyboard('{enter}')

    await selectEvent.select(envType, ['STAGING'], {
      container: document.body,
    })

    const button = screen.getByTestId('submit-button')
    expect(button).toBeEnabled()

    await userEvent.click(button)

    expect(editWebhookMock).toHaveBeenCalledWith({
      organizationId: '000-000-000',
      webhookId: mockWebhook.id,
      webhookRequest: {
        ...mockWebhook,
        target_url: 'https://test.com',
        kind: 'STANDARD',
        description: 'description',
        target_secret: undefined,
        events: mockWebhook.events,
        project_names_filter: ['test'],
        environment_types_filter: [...(mockWebhook.environment_types_filter || []), 'STAGING'],
      },
    })
  })

  it('should trim URL with trailing whitespace on create', async () => {
    const { userEvent } = renderWithProviders(<WebhookCrudModal {...props} />)

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

    expect(createWebhookMock).toHaveBeenCalledWith({
      organizationId: '000-000-000',
      webhookRequest: expect.objectContaining({
        target_url: 'https://test.com',
      }),
    })
  })

  it('should trim URL with leading whitespace on create', async () => {
    const { userEvent } = renderWithProviders(<WebhookCrudModal {...props} />)

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

    expect(createWebhookMock).toHaveBeenCalledWith({
      organizationId: '000-000-000',
      webhookRequest: expect.objectContaining({
        target_url: 'https://test.com',
      }),
    })
  })

  it('should trim URL with whitespace on edit', async () => {
    const { userEvent } = renderWithProviders(<WebhookCrudModal {...props} webhook={mockWebhook} />)

    const url = screen.getByLabelText('URL')

    await userEvent.clear(url)
    // Type URL with both leading and trailing whitespace
    await userEvent.type(url, '  https://updated.com  ')

    const button = screen.getByTestId('submit-button')
    await userEvent.click(button)

    expect(editWebhookMock).toHaveBeenCalledWith({
      organizationId: '000-000-000',
      webhookId: mockWebhook.id,
      webhookRequest: expect.objectContaining({
        target_url: 'https://updated.com',
      }),
    })
  })

  describe('secret field handling', () => {
    it('should show secret field as optional when creating new webhook', () => {
      renderWithProviders(<WebhookCrudModal {...props} />)

      expect(screen.getByLabelText('Secret')).toBeInTheDocument()
    })

    it('should not show secret field when editing webhook (before form is dirty)', () => {
      renderWithProviders(<WebhookCrudModal {...props} webhook={mockWebhookWithSecret} />)

      expect(screen.queryByLabelText('Secret')).not.toBeInTheDocument()
      expect(screen.queryByText('Confirm your secret')).not.toBeInTheDocument()
    })

    it('should show "Confirm your secret" section when editing webhook with existing secret and form is dirty', async () => {
      const { userEvent } = renderWithProviders(<WebhookCrudModal {...props} webhook={mockWebhookWithSecret} />)

      expect(screen.queryByText('Confirm your secret')).not.toBeInTheDocument()

      const description = screen.getByLabelText('Description')
      await userEvent.clear(description)
      await userEvent.type(description, 'updated description')

      expect(screen.getByText('Confirm your secret')).toBeInTheDocument()
      expect(screen.getByLabelText('Secret')).toBeInTheDocument()
    })

    it('should not show secret field when editing webhook without existing secret (even when dirty)', async () => {
      const { userEvent } = renderWithProviders(<WebhookCrudModal {...props} webhook={mockWebhook} />)

      const description = screen.getByLabelText('Description')
      await userEvent.clear(description)
      await userEvent.type(description, 'updated description')

      expect(screen.queryByText('Confirm your secret')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Secret')).not.toBeInTheDocument()
    })

    it('should require secret when editing webhook with existing secret', async () => {
      const { userEvent } = renderWithProviders(<WebhookCrudModal {...props} webhook={mockWebhookWithSecret} />)

      const description = screen.getByLabelText('Description')
      await userEvent.clear(description)
      await userEvent.type(description, 'updated description')

      const secret = screen.getByLabelText('Secret')
      expect(secret).toBeInTheDocument()

      const button = screen.getByTestId('submit-button')
      await userEvent.click(button)

      expect(editWebhookMock).not.toHaveBeenCalled()
    })

    it('should allow submit when editing webhook with existing secret and secret provided', async () => {
      const { userEvent } = renderWithProviders(<WebhookCrudModal {...props} webhook={mockWebhookWithSecret} />)

      const description = screen.getByLabelText('Description')
      await userEvent.clear(description)
      await userEvent.type(description, 'updated description')

      const secret = screen.getByLabelText('Secret')
      await userEvent.type(secret, 'new-secret-value')

      const button = screen.getByTestId('submit-button')
      await userEvent.click(button)

      expect(editWebhookMock).toHaveBeenCalledWith({
        organizationId: '000-000-000',
        webhookId: mockWebhookWithSecret.id,
        webhookRequest: expect.objectContaining({
          target_secret: 'new-secret-value',
        }),
      })
    })

    it('should display password type input for secret field when shown', async () => {
      const { userEvent } = renderWithProviders(<WebhookCrudModal {...props} webhook={mockWebhookWithSecret} />)

      const description = screen.getByLabelText('Description')
      await userEvent.type(description, 'x')

      const secret = screen.getByLabelText('Secret')
      expect(secret).toHaveAttribute('type', 'password')
    })

    it('should allow editing webhook without secret and not providing a secret', async () => {
      const { userEvent } = renderWithProviders(<WebhookCrudModal {...props} webhook={mockWebhook} />)

      const description = screen.getByLabelText('Description')
      await userEvent.clear(description)
      await userEvent.type(description, 'updated description')

      const button = screen.getByTestId('submit-button')
      await userEvent.click(button)

      expect(editWebhookMock).toHaveBeenCalledWith({
        organizationId: '000-000-000',
        webhookId: mockWebhook.id,
        webhookRequest: expect.objectContaining({
          target_secret: undefined,
        }),
      })
    })
  })
})

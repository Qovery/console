import selectEvent from 'react-select-event'
import * as organizationDomain from '@qovery/domains/organizations/feature'
import { webhookFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import WebhookCrudModalFeature, { type WebhookCrudModalFeatureProps } from './webhook-crud-modal-feature'

const mockWebhook = webhookFactoryMock(1)[0]
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
})

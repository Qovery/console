import { act, fireEvent, getByLabelText, getByTestId, waitFor } from '__tests__/utils/setup-jest'
import { render } from '__tests__/utils/setup-jest'
import selectEvent from 'react-select-event'
import * as organizationDomain from '@qovery/domains/organization'
import { webhookFactoryMock } from '@qovery/shared/factories'
import WebhookCrudModalFeature, { WebhookCrudModalFeatureProps } from './webhook-crud-modal-feature'

const mockWebhook = webhookFactoryMock(1)[0]
const props: WebhookCrudModalFeatureProps = {
  closeModal: jest.fn(),
  organizationId: 'organizationId',
  webhook: undefined,
}

const useEditWebhooksMockSpy = jest.spyOn(organizationDomain, 'useEditWebhook') as jest.Mock
const useCreateWebhookMockSpy = jest.spyOn(organizationDomain, 'useCreateWebhook') as jest.Mock

describe('WebhookCrudModalFeature', () => {
  beforeEach(() => {
    useEditWebhooksMockSpy.mockReturnValue({
      mutate: jest.fn(),
    })
    useCreateWebhookMockSpy.mockReturnValue({
      mutate: jest.fn(),
    })
  })

  it('should render successfully', () => {
    const { baseElement } = render(<WebhookCrudModalFeature {...props} webhook={mockWebhook} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render all the inputs', () => {
    const { baseElement } = render(<WebhookCrudModalFeature {...props} webhook={mockWebhook} />)
    getByLabelText(baseElement, 'URL')
    getByLabelText(baseElement, 'Kind')
    getByLabelText(baseElement, 'Description')
    getByLabelText(baseElement, 'Secret')
    getByLabelText(baseElement, 'Events')
    getByTestId(baseElement, 'project-filter-input')
    getByLabelText(baseElement, 'Environment type filter')
  })

  it('should mutate useCreateWebhook', async () => {
    const { baseElement } = render(<WebhookCrudModalFeature {...props} />)
    const url = getByLabelText(baseElement, 'URL')
    const kind = getByLabelText(baseElement, 'Kind')
    const description = getByLabelText(baseElement, 'Description')
    const secret = getByLabelText(baseElement, 'Secret')
    const events = getByLabelText(baseElement, 'Events')
    const tags = getByTestId(baseElement, 'input-tags-field')
    const envType = getByLabelText(baseElement, 'Environment type filter')

    fireEvent.change(url, { target: { value: 'https://test.com' } })
    await selectEvent.select(kind, ['Standard'], {
      container: document.body,
    })
    fireEvent.change(description, { target: { value: 'description' } })
    fireEvent.change(secret, { target: { value: 'secret' } })

    await selectEvent.select(events, ['DEPLOYMENT_STARTED'], {
      container: document.body,
    })

    fireEvent.input(tags, { target: { value: 'test' } })
    fireEvent.keyDown(tags, { key: 'Enter', keyCode: 13 })

    await selectEvent.select(envType, ['STAGING'], {
      container: document.body,
    })

    const button = getByTestId(baseElement, 'submit-button')
    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })

    await act(() => {
      fireEvent.click(button)
    })
    expect(useCreateWebhookMockSpy().mutate).toHaveBeenCalledWith({
      organizationId: 'organizationId',
      data: {
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
    const { baseElement } = render(<WebhookCrudModalFeature {...props} webhook={mockWebhook} />)
    const url = getByLabelText(baseElement, 'URL')
    const kind = getByLabelText(baseElement, 'Kind')
    const description = getByLabelText(baseElement, 'Description')
    const secret = getByLabelText(baseElement, 'Secret')
    const tags = getByTestId(baseElement, 'input-tags-field')
    const envType = getByLabelText(baseElement, 'Environment type filter')

    fireEvent.change(url, { target: { value: 'https://test.com' } })
    await selectEvent.select(kind, ['Standard'], {
      container: document.body,
    })
    fireEvent.change(description, { target: { value: 'description' } })
    fireEvent.change(secret, { target: { value: 'secret' } })

    fireEvent.input(tags, { target: { value: 'test' } })
    fireEvent.keyDown(tags, { key: 'Enter', keyCode: 13 })

    await selectEvent.select(envType, ['STAGING'], {
      container: document.body,
    })

    const button = getByTestId(baseElement, 'submit-button')
    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })

    await act(() => {
      fireEvent.click(button)
    })
    expect(useEditWebhooksMockSpy().mutate).toHaveBeenCalledWith({
      organizationId: 'organizationId',
      webhookId: mockWebhook.id,
      data: {
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

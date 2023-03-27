import { act, fireEvent, getByLabelText, getByTestId } from '@testing-library/react'
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
    const { baseElement, debug } = render(<WebhookCrudModalFeature {...props} webhook={mockWebhook} />)
    const url = getByLabelText(baseElement, 'URL')
    const kind = getByLabelText(baseElement, 'Kind')
    const description = getByLabelText(baseElement, 'Description')
    const secret = getByLabelText(baseElement, 'Secret')
    const events = getByLabelText(baseElement, 'Events')
    const tags = getByTestId(baseElement, 'input-tags-field')
    const envType = getByLabelText(baseElement, 'Environment type filter')

    await act(() => {
      fireEvent.change(url, { target: { value: 'https://test.com' } })
      selectEvent.select(kind, 'Standard')
      fireEvent.change(description, { target: { value: 'description' } })
      fireEvent.change(secret, { target: { value: 'secret' } })

      // todo debug this, the select will not update its value
      selectEvent.select(events, ['DEPLOYMENT_STARTED'])

      fireEvent.input(tags, { target: { value: 'test' } })
      fireEvent.keyDown(tags, { key: 'Enter', keyCode: 13 })

      selectEvent.select(envType, ['STAGING'])
    })

    //debug(getByTestId(baseElement, 'project-filter-input'))
    debug(getByTestId(baseElement, 'test-debug'))
    //expect(getByTestId(baseElement, 'submit-button')).not.toBeDisabled()
  })
})

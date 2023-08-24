import { act, fireEvent, getByLabelText, getByText, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import {
  EnvironmentModeEnum,
  type OrganizationWebhookCreateRequest,
  OrganizationWebhookEventEnum,
  OrganizationWebhookKindEnum,
} from 'qovery-typescript-axios'
import WebhookCrudModal, { type WebhookCrudModalProps } from './webhook-crud-modal'

const props: WebhookCrudModalProps = {
  onSubmit: jest.fn((e) => e.preventDefault()),
  isEdition: false,
  closeModal: jest.fn(),
}

describe('WebhookCrudModal', () => {
  const defaultValues: OrganizationWebhookCreateRequest = {
    target_url: 'https://test.com',
    kind: OrganizationWebhookKindEnum.STANDARD,
    description: 'description',
    target_secret: 'secret',
    events: [OrganizationWebhookEventEnum.STARTED],
    project_names_filter: ['test'],
    environment_types_filter: [EnvironmentModeEnum.PRODUCTION],
  }
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<OrganizationWebhookCreateRequest>(<WebhookCrudModal {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should display create', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<OrganizationWebhookCreateRequest>(<WebhookCrudModal {...props} isEdition={false} />, {
        defaultValues,
      })
    )
    getByText(baseElement, 'Create')
  })

  it('should display update', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<OrganizationWebhookCreateRequest>(<WebhookCrudModal {...props} isEdition={true} />, {
        defaultValues,
      })
    )
    getByText(baseElement, 'Update')
  })

  it('should call onSubmit', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy
    const { baseElement } = render(
      wrapWithReactHookForm<OrganizationWebhookCreateRequest>(<WebhookCrudModal {...props} />, {
        defaultValues,
      })
    )
    const url = getByLabelText(baseElement, 'URL')
    await act(() => {
      fireEvent.change(url, { target: { value: 'https://test.com' } })
    })

    const button = getByText(baseElement, 'Create')

    await act(() => {
      button.click()
    })

    expect(props.onSubmit).toHaveBeenCalled()
  })
})

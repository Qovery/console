import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import {
  EnvironmentModeEnum,
  type OrganizationWebhookCreateRequest,
  OrganizationWebhookEventEnum,
  OrganizationWebhookKindEnum,
} from 'qovery-typescript-axios'
import { fireEvent, renderWithProviders, screen } from '@qovery/shared/util-tests'
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
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm<OrganizationWebhookCreateRequest>(<WebhookCrudModal {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should display create', () => {
    renderWithProviders(
      wrapWithReactHookForm<OrganizationWebhookCreateRequest>(<WebhookCrudModal {...props} isEdition={false} />, {
        defaultValues,
      })
    )
    screen.getByText('Create')
  })

  it('should display update', () => {
    renderWithProviders(
      wrapWithReactHookForm<OrganizationWebhookCreateRequest>(<WebhookCrudModal {...props} isEdition={true} />, {
        defaultValues,
      })
    )
    screen.getByText('Update')
  })

  it('should call onSubmit', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm<OrganizationWebhookCreateRequest>(<WebhookCrudModal {...props} />, {
        defaultValues,
      })
    )
    const url = screen.getByLabelText('URL')
    fireEvent.change(url, { target: { value: 'https://test.com' } })

    const button = screen.getByText('Create')

    await userEvent.click(button)

    expect(props.onSubmit).toHaveBeenCalled()
  })
})

import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import StepPersonalize, { type StepPersonalizeProps } from './step-personalize'

describe('StepPersonalize', () => {
  let props: Partial<StepPersonalizeProps>

  beforeEach(() => {
    props = {
      dataCloudProviders: [{ label: 'some-label', value: 'some-value', icon: <div>some-icon</div> }],
      dataQoveryUsage: [{ label: 'some-label', value: 'some-value' }],
      onSubmit: jest.fn(),
      authLogout: jest.fn(),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<StepPersonalize {...(props as StepPersonalizeProps)} />, {
        defaultValues: {
          first_name: '',
          last_name: '',
          user_email: '',
          company_name: '',
          qovery_usage: '',
          qovery_usage_other: '',
          infrastructure_hosting: '',
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should require company name before continuing', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<StepPersonalize {...(props as StepPersonalizeProps)} />, {
        defaultValues: {
          first_name: 'John',
          last_name: 'Doe',
          user_email: 'john.doe@example.com',
          company_name: '',
          qovery_usage: 'some-value',
          qovery_usage_other: '',
          infrastructure_hosting: 'some-value',
        },
      })
    )

    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Company name'), 'Acme Corp')

    await waitFor(() => expect(continueButton).toBeEnabled())
  })
})

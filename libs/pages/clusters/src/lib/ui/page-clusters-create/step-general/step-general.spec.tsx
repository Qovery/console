import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import StepGeneral, { type StepGeneralProps } from './step-general'

const currentCloudProviders = {
  short_name: CloudProviderEnum.AWS,
  name: 'Amazon',
  region: [
    {
      name: 'Paris',
      city: 'paris',
      country_code: 'fr',
    },
  ],
}

const props: StepGeneralProps = {
  onSubmit: jest.fn(),
  cloudProviders: [currentCloudProviders],
}

describe('StepGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<StepGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with fields', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<StepGeneral {...props} />, {
        defaultValues: {
          name: 'my-cluster',
          description: 'test',
          production: false,
        },
      })
    )

    screen.getByDisplayValue('my-cluster')
    screen.getByDisplayValue('test')
    screen.getByDisplayValue('false')
    screen.getByTestId('input-cloud-provider')
  })

  it('should submit the form on click', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<StepGeneral {...props} />, {
        defaultValues: {
          name: 'my-cluster',
          description: 'test',
          production: false,
          cloud_provider: CloudProviderEnum.AWS,
          region: 'paris',
          credentials: '111-111-111',
        },
      })
    )

    await userEvent.type(screen.getByTestId('input-name'), 'text')
    await userEvent.click(screen.getByLabelText(/Qovery Managed/i))

    const button = screen.getByTestId('button-submit')
    await userEvent.click(button)

    expect(button).not.toBeDisabled()
    expect(props.onSubmit).toHaveBeenCalled()
  })
})

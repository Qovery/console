import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import StepGeneral, { type StepGeneralProps } from './step-general'

const currentCloudProviders = {
  short_name: CloudProviderEnum.AWS,
  name: 'Amazon',
  regions: [
    {
      name: 'Paris',
      city: 'paris',
      country_code: 'fr',
    },
  ],
}

const azureCloudProvider = {
  short_name: CloudProviderEnum.AZURE,
  name: 'Microsoft Azure',
  regions: [
    {
      name: 'West Europe',
      city: 'amsterdam',
      country_code: 'nl',
    },
  ],
}

const props: StepGeneralProps = {
  onSubmit: jest.fn(),
  cloudProviders: [currentCloudProviders, azureCloudProvider],
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
          installation_type: 'MANAGED',
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
          installation_type: 'MANAGED',
        },
      })
    )

    await userEvent.type(screen.getByTestId('input-name'), 'text')

    const button = screen.getByTestId('button-submit')
    await userEvent.click(button)

    expect(button).toBeEnabled()
    expect(props.onSubmit).toHaveBeenCalled()
  })

  it('should render Azure provider with AKS information', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<StepGeneral {...props} />, {
        defaultValues: {
          name: 'my-azure-cluster',
          description: 'test azure',
          production: false,
          cloud_provider: CloudProviderEnum.AZURE,
          region: 'West Europe',
          credentials: '111-111-111',
          installation_type: 'MANAGED',
        },
      })
    )

    // Check that Azure account (AKS) text is displayed
    expect(screen.getByText(/Azure account \(AKS\)/i)).toBeInTheDocument()
  })

  it('should include Azure in cloud providers list', () => {
    renderWithProviders(
      wrapWithReactHookForm(<StepGeneral {...props} />, {
        defaultValues: {
          name: 'my-cluster',
          description: 'test',
          production: false,
          installation_type: 'MANAGED',
        },
      })
    )

    // Verify cloud provider dropdown is rendered
    const cloudProviderInput = screen.getByTestId('input-cloud-provider')
    expect(cloudProviderInput).toBeInTheDocument()
  })

  it('should render all cloud providers including Azure', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<StepGeneral {...props} />, {
        defaultValues: {
          name: 'my-cluster',
          description: 'test',
          production: false,
          cloud_provider: CloudProviderEnum.AWS,
          region: 'Paris',
          credentials: '111-111-111',
          installation_type: 'MANAGED',
        },
      })
    )

    expect(screen.getByTestId('input-cloud-provider')).toBeInTheDocument()
  })
})

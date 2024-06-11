import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { BuildModeEnum, GitProviderEnum } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import StepGeneral, { type StepGeneralProps } from './step-general'

const mockOrganization = organizationFactoryMock(1)[0]
const props: StepGeneralProps = {
  organization: mockOrganization,
  onSubmit: jest.fn(),
}

describe('StepGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<StepGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form on click', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<StepGeneral {...props} />, {
        defaultValues: {
          name: 'test',
          description: 'test',
          serviceType: ServiceTypeEnum.APPLICATION,
          build_mode: BuildModeEnum.DOCKER,
          branch: 'main',
          repository: 'qovery/console',
          provider: GitProviderEnum.GITHUB,
          root_path: '/',
          dockerfile_path: '/dockerfile',
        },
      })
    )

    const button = screen.getByTestId('button-submit')
    await userEvent.click(button)

    expect(button).toBeEnabled()
    expect(props.onSubmit).toHaveBeenCalled()
  })

  it('should display git application inputs for APPLICATION', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<StepGeneral {...props} />, {
        defaultValues: {
          name: 'test',
          description: 'test',
          serviceType: ServiceTypeEnum.APPLICATION,
        },
      })
    )

    screen.getAllByText(/git provider/i)
    screen.getByText(/The service will be automatically updated on every new commit on the branch./i)
    const registryInput = screen.queryByTestId('input-select-registry')
    expect(registryInput).not.toBeInTheDocument()
  })

  it('should display git application inputs for CONTAINER', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<StepGeneral {...props} />, {
        defaultValues: {
          name: 'test',
          description: 'test',
          serviceType: ServiceTypeEnum.CONTAINER,
        },
      })
    )

    screen.getByTestId('input-select-registry')
    screen.getByText(
      /The service will be automatically updated if Qovery is notified on the API that a new image tag is available./i
    )
    const providerInput = screen.queryByTestId('input-provider')
    expect(providerInput).not.toBeInTheDocument()
  })

  it('should display neighter git application nor container inputs', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<StepGeneral {...props} />, {
        defaultValues: {
          name: 'test',
          description: 'test',
          serviceType: undefined,
        },
      })
    )

    const registryInput = screen.queryByTestId('input-select-registry')
    const providerInput = screen.queryByTestId('input-provider')
    expect(providerInput).not.toBeInTheDocument()
    expect(registryInput).not.toBeInTheDocument()
  })
})

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

jest.mock('@qovery/domains/organizations/feature', () => ({
  ...jest.requireActual('@qovery/domains/organizations/feature'),
  useContainerRegistries: () => ({
    data: [
      {
        id: 'registry-1',
        name: 'my-registry',
        kind: 'DOCKER_HUB',
      },
    ],
  }),
  useContainerImages: () => ({
    data: [
      {
        image_name: 'my-image',
        versions: ['1.0.0'],
      },
    ],
    isFetching: false,
    refetch: () => Promise.resolve(),
  }),
  useContainerVersions: () => ({
    data: [
      {
        image_name: 'my-image',
        versions: ['1.0.0'],
      },
    ],
    isFetching: false,
  }),
}))

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
    const registryInput = screen.queryByTestId('input-select-registry')
    expect(registryInput).not.toBeInTheDocument()
  })

  it('should handle empty and filled values for docker target build stage', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<StepGeneral {...props} />, {
        defaultValues: {
          name: 'test',
          description: 'test',
          serviceType: ServiceTypeEnum.APPLICATION,
          build_mode: BuildModeEnum.DOCKER,
          docker_target_build_stage: 'build',
        },
      })
    )

    const stageInput = screen.getByLabelText(/Dockerfile stage/i)
    expect(stageInput).toHaveValue('build')

    await userEvent.clear(stageInput)
    await userEvent.type(stageInput, 'production')
    expect(stageInput).toHaveValue('production')
  })

  it('should submit form with empty docker target build stage', async () => {
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
          docker_target_build_stage: '',
        },
      })
    )

    const button = screen.getByTestId('button-submit')
    await userEvent.click(button)

    expect(button).toBeEnabled()
    expect(props.onSubmit).toHaveBeenCalled()
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

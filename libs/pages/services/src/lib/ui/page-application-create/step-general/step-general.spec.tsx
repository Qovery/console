import { act } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { BuildModeEnum, GitProviderEnum } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { organizationFactoryMock } from '@qovery/shared/factories'
import StepGeneral, { StepGeneralProps } from './step-general'

const mockOrganization = organizationFactoryMock(1)[0]
const props: StepGeneralProps = {
  organization: mockOrganization,
  onSubmit: jest.fn(),
}

describe('StepGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<StepGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form on click', async () => {
    const { getByTestId } = render(
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

    const button = getByTestId('button-submit')
    // wait one cycle that the button becomes enabled
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await act(() => {})

    await act(() => {
      button.click()
    })

    expect(button).not.toBeDisabled()
    expect(props.onSubmit).toHaveBeenCalled()
  })

  it('should display git application inputs', async () => {
    const { getByTestId, queryByTestId } = render(
      wrapWithReactHookForm(<StepGeneral {...props} />, {
        defaultValues: {
          name: 'test',
          description: 'test',
          serviceType: ServiceTypeEnum.APPLICATION,
        },
      })
    )

    getByTestId('input-provider')
    const registryInput = queryByTestId('input-select-registry')
    expect(registryInput).toBeNull()
  })

  it('should display git application inputs', async () => {
    const { getByTestId, queryByTestId } = render(
      wrapWithReactHookForm(<StepGeneral {...props} />, {
        defaultValues: {
          name: 'test',
          description: 'test',
          serviceType: ServiceTypeEnum.CONTAINER,
        },
      })
    )

    getByTestId('input-select-registry')
    const providerInput = queryByTestId('input-provider')
    expect(providerInput).toBeNull()
  })

  it('should display neighter git application nor container inputs', async () => {
    const { queryByTestId } = render(
      wrapWithReactHookForm(<StepGeneral {...props} />, {
        defaultValues: {
          name: 'test',
          description: 'test',
          serviceType: undefined,
        },
      })
    )

    const registryInput = queryByTestId('input-select-registry')
    const providerInput = queryByTestId('input-provider')
    expect(providerInput).toBeNull()
    expect(registryInput).toBeNull()
  })
})

import { act } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { BuildModeEnum, GitProviderEnum } from 'qovery-typescript-axios'
import { organizationFactoryMock } from '@qovery/domains/organization'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import PageApplicationCreateGeneral, { PageApplicationCreateGeneralProps } from './page-application-create-general'

const mockOrganization = organizationFactoryMock(1)[0]
const props: PageApplicationCreateGeneralProps = {
  organization: mockOrganization,
  onSubmit: jest.fn(),
}

describe('PageApplicationCreateGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageApplicationCreateGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form on click', async () => {
    const { getByTestId } = render(
      wrapWithReactHookForm(<PageApplicationCreateGeneral {...props} />, {
        defaultValues: {
          name: 'test',
          applicationSource: ServiceTypeEnum.APPLICATION,
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
    await act(() => {})

    await act(() => {
      button.click()
    })

    expect(button).not.toBeDisabled()
    expect(props.onSubmit).toHaveBeenCalled()
  })

  it('should display git application inputs', async () => {
    const { getByTestId, queryByTestId } = render(
      wrapWithReactHookForm(<PageApplicationCreateGeneral {...props} />, {
        defaultValues: {
          name: 'test',
          applicationSource: ServiceTypeEnum.APPLICATION,
        },
      })
    )

    getByTestId('input-provider')
    const registryInput = queryByTestId('input-select-registry')
    expect(registryInput).toBeNull()
  })

  it('should display git application inputs', async () => {
    const { getByTestId, queryByTestId } = render(
      wrapWithReactHookForm(<PageApplicationCreateGeneral {...props} />, {
        defaultValues: {
          name: 'test',
          applicationSource: ServiceTypeEnum.CONTAINER,
        },
      })
    )

    getByTestId('input-select-registry')
    const providerInput = queryByTestId('input-provider')
    expect(providerInput).toBeNull()
  })

  it('should display neighter git application nor container inputs', async () => {
    const { queryByTestId } = render(
      wrapWithReactHookForm(<PageApplicationCreateGeneral {...props} />, {
        defaultValues: {
          name: 'test',
          applicationSource: undefined,
        },
      })
    )

    const registryInput = queryByTestId('input-select-registry')
    const providerInput = queryByTestId('input-provider')
    expect(providerInput).toBeNull()
    expect(registryInput).toBeNull()
  })
})

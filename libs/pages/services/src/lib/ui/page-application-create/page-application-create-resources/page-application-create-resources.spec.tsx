import { act } from '@testing-library/react'
import ResizeObserver from '__tests__/utils/resize-observer'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { organizationFactoryMock } from '@qovery/domains/organization'
import PageApplicationCreateResources, {
  PageApplicationCreateResourcesProps,
} from './page-application-create-resources'

const mockOrganization = organizationFactoryMock(1)[0]
const props: PageApplicationCreateResourcesProps = {
  onBack: jest.fn(),
  onSubmit: jest.fn(),
}

describe('PageApplicationCreateResources', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<PageApplicationCreateResources {...props} />, {
        defaultValues: {
          memory: 1024,
          cpu: [1],
          instances: [1, 12],
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form on click', async () => {
    window.ResizeObserver = ResizeObserver
    const { getByTestId } = render(
      wrapWithReactHookForm(<PageApplicationCreateResources {...props} />, {
        defaultValues: {
          memory: 1024,
          cpu: [1],
          instances: [1, 12],
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
})

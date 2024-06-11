import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { StepKubeconfig } from './step-kubeconfig'

describe('StepKubeconfig', () => {
  it('should match snapshot', () => {
    const onSubmit = jest.fn()
    const { container } = renderWithProviders(
      wrapWithReactHookForm(<StepKubeconfig onSubmit={onSubmit} />, {
        defaultValues: {},
      })
    )
    expect(container).toMatchSnapshot()
  })
  it('should match snapshot with data', () => {
    const onSubmit = jest.fn()
    const { container } = renderWithProviders(
      wrapWithReactHookForm(<StepKubeconfig onSubmit={onSubmit} />, {
        defaultValues: {
          file_name: 'file.yaml',
          file_content: '',
          file_size: 1234,
        },
      })
    )
    expect(container).toMatchSnapshot()
  })
})

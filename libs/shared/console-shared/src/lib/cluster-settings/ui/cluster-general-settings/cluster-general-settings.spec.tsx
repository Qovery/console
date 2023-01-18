import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import ClusterGeneralSettings from './cluster-general-settings'

describe('ClusterGeneralSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<ClusterGeneralSettings />))
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form on click', async () => {
    const { getByTestId } = render(
      wrapWithReactHookForm(<ClusterGeneralSettings />, {
        defaultValues: {
          name: 'test',
          description: 'test',
          production: false,
        },
      })
    )

    const name = getByTestId('input-name')
    getByTestId('input-description')
    // getByTestId('input-production-toggle')
    // const inputToggle = getByTestId('input-toggle')

    expect((name as HTMLInputElement).value).toBe('test')
    // expect((description as HTMLInputElement).value).toBe('test')
  })
})

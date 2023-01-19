import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { ClusterGeneralData } from '@qovery/shared/interfaces'
import ClusterGeneralSettings, { ClusterGeneralSettingsProps } from './cluster-general-settings'

describe('ClusterGeneralSettings', () => {
  const props: ClusterGeneralSettingsProps = {
    fromDetail: false,
  }
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<ClusterGeneralSettings {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form on click', async () => {
    const { getByTestId } = render(
      wrapWithReactHookForm<ClusterGeneralData>(<ClusterGeneralSettings {...props} />, {
        defaultValues: {
          name: 'test',
          description: 'test',
          production: false,
        },
      })
    )

    const name = getByTestId('input-name')
    const description = getByTestId('input-description')
    const toggle = getByTestId('input-production-toggle')

    expect((name as HTMLInputElement).value).toBe('test')
    expect((description.querySelector('textarea') as HTMLTextAreaElement).value).toBe('test')
    expect((toggle.querySelector('input') as HTMLInputElement).value).toBe('false')
  })
})

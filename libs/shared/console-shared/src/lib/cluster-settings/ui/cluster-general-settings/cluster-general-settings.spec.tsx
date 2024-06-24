import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type ClusterGeneralData } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ClusterGeneralSettings, { type ClusterGeneralSettingsProps } from './cluster-general-settings'

describe('ClusterGeneralSettings', () => {
  const props: ClusterGeneralSettingsProps = {
    fromDetail: false,
  }
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<ClusterGeneralSettings {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should init well the inputs with the form default values', async () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterGeneralData>(<ClusterGeneralSettings {...props} />, {
        defaultValues: {
          name: 'test',
          description: 'test',
          production: false,
        },
      })
    )

    const name = screen.getByTestId('input-name')
    const description = screen.getByTestId('input-description')
    const toggle = screen.getByTestId('input-production-toggle')

    expect((name as HTMLInputElement).value).toBe('test')
    expect((description.querySelector('textarea') as HTMLTextAreaElement).value).toBe('test')
    expect((toggle.querySelector('input') as HTMLInputElement).value).toBe('false')
  })
})

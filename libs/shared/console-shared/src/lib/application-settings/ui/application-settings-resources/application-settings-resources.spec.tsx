import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import ApplicationSettingsResources, { type ApplicationSettingsResourcesProps } from './application-settings-resources'

const props: ApplicationSettingsResourcesProps = {
  service: undefined,
  displayWarningCpu: false,
}

describe('SettingsResources', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<ApplicationSettingsResources {...props} />, {
        defaultValues: {
          instances: [1, 18],
          cpu: [3],
          memory: 1024,
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import ApplicationSettingsResources, { type ApplicationSettingsResourcesProps } from './application-settings-resources'

const props: ApplicationSettingsResourcesProps = {
  application: undefined,
  displayWarningCpu: false,
}

describe('SettingsResources', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
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

import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import ApplicationSettingsPorts, { ApplicationSettingsPortsProps } from './application-settings-ports'

const props: ApplicationSettingsPortsProps = {
  application: undefined,
  displayWarningCpu: false,
}

describe('ApplicationSettingsPorts', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<ApplicationSettingsPorts {...props} />, {
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

import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import SettingsResources, { SettingsResourcesProps } from './setting-resources'

const props: SettingsResourcesProps = {
  application: undefined,
  displayWarningCpu: false,
}

describe('SettingsResources', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<SettingsResources {...props} />, {
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

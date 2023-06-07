import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import DatabaseSettingsResources, { DatabaseSettingsResourcesProps } from './database-settings-resources'

const props: DatabaseSettingsResourcesProps = {
  application: undefined,
  displayWarningCpu: false,
}

describe('DatabaseSettingsResources', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<DatabaseSettingsResources {...props} />, {
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

import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import SettingResourcesInstanceTypesFeature, { SettingResourcesInstanceTypesFeatureProps } from './setting-resources'

const props: SettingResourcesInstanceTypesFeatureProps = {
  application: undefined,
  displayWarningCpu: false,
}

describe('SettingResourcesInstanceTypesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<SettingResourcesInstanceTypesFeature {...props} />, {
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

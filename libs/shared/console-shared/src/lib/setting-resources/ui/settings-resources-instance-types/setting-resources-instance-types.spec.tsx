import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import SettingResourcesInstanceTypes, { SettingResourcesInstanceTypesProps } from './setting-resources-instance-types'

const props: SettingResourcesInstanceTypesProps = {
  application: undefined,
  displayWarningCpu: false,
}

describe('SettingResourcesInstanceTypes', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<SettingResourcesInstanceTypes {...props} />, {
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

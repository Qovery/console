import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import SettingsResourcesInstanceTypes, { SettingsResourcesInstanceTypesProps } from './setting-resources-instance-types'

const props: SettingsResourcesInstanceTypesProps = {}

describe('SettingsResourcesInstanceTypes', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<SettingsResourcesInstanceTypes {...props} />, {
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

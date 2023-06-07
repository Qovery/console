import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { DatabaseTypeEnum } from 'qovery-typescript-axios'
import SettingsResourcesInstanceTypesFeature, {
  SettingsResourcesInstanceTypesFeatureProps,
} from './setting-resources-instance-types-feature'

const props: SettingsResourcesInstanceTypesFeatureProps = {
  databaseType: DatabaseTypeEnum.MYSQL,
  displayWarning: true,
}

describe('SettingsResourcesInstanceTypesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<SettingsResourcesInstanceTypesFeature {...props} />, {
        defaultValues: {
          instance_type: 'db.t3.medium',
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })
})

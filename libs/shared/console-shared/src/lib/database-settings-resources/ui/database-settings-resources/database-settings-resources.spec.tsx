import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { DatabaseTypeEnum } from 'qovery-typescript-axios'
import { databaseFactoryMock } from '@qovery/shared/factories'
import DatabaseSettingsResources, { type DatabaseSettingsResourcesProps } from './database-settings-resources'

const props: DatabaseSettingsResourcesProps = {
  database: databaseFactoryMock(1)[0],
  isDatabase: true,
  isManaged: true,
  databaseType: DatabaseTypeEnum.MYSQL,
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

import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { DatabaseTypeEnum } from 'qovery-typescript-axios'
import { databaseFactoryMock } from '@qovery/shared/factories'
import { renderWithRouter } from '@qovery/shared/util-tests'
import DatabaseSettingsResources, { type DatabaseSettingsResourcesProps } from './database-settings-resources'

jest.unmock('@tanstack/react-router')

jest.mock('@qovery/domains/cloud-providers/feature', () => ({
  useCloudProviderDatabaseInstanceTypes: () => ({
    data: [{ name: 'db.t3.small' }],
  }),
}))

const props: DatabaseSettingsResourcesProps = {
  database: databaseFactoryMock(1)[0],
  isManaged: true,
  databaseType: DatabaseTypeEnum.MYSQL,
}

describe('DatabaseSettingsResources', () => {
  it('should render successfully', async () => {
    const { baseElement } = await renderWithRouter(
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

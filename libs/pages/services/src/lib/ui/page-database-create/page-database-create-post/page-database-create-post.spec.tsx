import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import PageDatabaseCreatePost, { PageDatabaseCreatePostProps } from './page-database-create-post'

const props: PageDatabaseCreatePostProps = {
  generalData: {
    name: 'test',
    accessibility: DatabaseAccessibilityEnum.PRIVATE,
    version: '1',
    type: DatabaseTypeEnum.MYSQL,
    mode: DatabaseModeEnum.MANAGED,
  },
  resourcesData: {
    storage: 1,
    cpu: [100],
    storage_unit: 'GB',
    memory: 100,
    memory_unit: 'MB',
  },
  gotoGlobalInformation: jest.fn(),
  gotoResources: jest.fn(),
  isLoadingCreate: false,
  isLoadingCreateAndDeploy: false,
  onPrevious: jest.fn(),
  onSubmit: jest.fn(),
}

describe('PageDatabaseCreatePost', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageDatabaseCreatePost {...props} />))
    expect(baseElement).toBeTruthy()
  })
})

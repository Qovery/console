import { render } from '__tests__/utils/setup-jest'
import { Route, Routes } from 'react-router'
import { PageDatabaseCreateFeature } from './page-database-create-feature'

jest.mock('react-router', () => ({
  ...(jest.requireActual('react-router') as any),
  useParams: () => ({ organizationId: '1', projectId: '2', environmentId: '3' }),
}))

describe('PageDatabaseCreateFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Routes location={'/organization/1/project/2/environment/3/services/create/database'}>
        <Route
          path={'/organization/1/project/2/environment/3/services/create/database/*'}
          element={<PageDatabaseCreateFeature />}
        ></Route>
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})

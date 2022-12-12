import { render } from '__tests__/utils/setup-jest'
import { Route, Routes } from 'react-router-dom'
import PageDatabaseCreateFeature from './page-database-create-feature'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router'),
  useParams: () => ({ organizationId: '1', projectId: '2', environmentId: '3' }),
}))

describe('PageDatabaseCreateFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Routes location="/organization/1/project/2/environment/3/services/create/database/general">
        <Route
          path="/organization/1/project/2/environment/3/services/create/database/*"
          element={<PageDatabaseCreateFeature />}
        />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})

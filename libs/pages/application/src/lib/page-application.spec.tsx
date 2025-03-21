import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageApplication from './page-application'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1', projectId: '2', environmentId: '3', applicationId: '4' }),
}))

describe('PagesApplication', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <Routes location="/organization/1/project/2/environment/3/application/4/*">
        <Route path="/organization/1/project/2/environment/3/application/4/general" element={<PageApplication />} />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})

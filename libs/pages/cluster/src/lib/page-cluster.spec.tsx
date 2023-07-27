import { render } from '__tests__/utils/setup-jest'
import { Route, Routes } from 'react-router-dom'
import PageCluster from './page-cluster'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1', clusterId: '2' }),
}))

describe('PageCluster', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Routes location="/organization/1/cluster/2/settings/*">
        <Route path="/organization/1/cluster/2/settings/general" element={<PageCluster />} />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})

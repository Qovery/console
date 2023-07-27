import { render } from '__tests__/utils/setup-jest'
import { Route, Routes } from 'react-router-dom'
import PageClustersCreateFeature from './page-clusters-create-feature'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
}))

describe('PageClustersCreateFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Routes location="/organization/1/clusters/create/general">
        <Route path="/organization/1/clusters/create/*" element={<PageClustersCreateFeature />} />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})

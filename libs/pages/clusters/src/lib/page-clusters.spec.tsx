import { render } from '__tests__/utils/setup-jest'
import { Route, Routes } from 'react-router-dom'
import PageClusters from './page-clusters'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
  Link: () => <div />,
}))

describe('PageClusters', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Routes location="/organization/1/clusters/general">
        <Route path="/organization/1/clusters/*" element={<PageClusters />} />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })
})

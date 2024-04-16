import { Route, Routes } from 'react-router-dom'
import { IntercomProvider } from 'react-use-intercom'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageClustersCreateFeature from './page-clusters-create-feature'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
}))

describe('PageClustersCreateFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <Routes location="/organization/1/clusters/create/general">
          <Route path="/organization/1/clusters/create/*" element={<PageClustersCreateFeature />} />
        </Routes>
      </IntercomProvider>
    )
    expect(baseElement).toBeTruthy()
  })
})

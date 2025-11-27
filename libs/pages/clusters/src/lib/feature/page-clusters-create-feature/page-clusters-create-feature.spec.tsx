import { Route, Routes } from 'react-router-dom'
import { IntercomProvider } from 'react-use-intercom'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageClustersCreateFeature, { steps } from './page-clusters-create-feature'

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

  describe('steps function', () => {
    it('should return correct steps for Scaleway cluster creation', () => {
      const scwSteps = steps({
        installation_type: 'MANAGED',
        cloud_provider: 'SCW',
      } as any)

      expect(scwSteps).toHaveLength(4)
      expect(scwSteps[0]).toEqual({ title: 'Create new cluster', key: 'general' })
      expect(scwSteps[1]).toEqual({ title: 'Resources', key: 'resources' })
      expect(scwSteps[2]).toEqual({ title: 'Network configuration', key: 'features' })
      expect(scwSteps[3]).toEqual({ title: 'Ready to install', key: 'summary' })
    })

    it('should include features step for Scaleway to fix progress bar navigation', () => {
      const scwSteps = steps({
        installation_type: 'MANAGED',
        cloud_provider: 'SCW',
      } as any)

      const featuresStepIndex = scwSteps.findIndex((step) => step.key === 'features')
      expect(featuresStepIndex).toBeGreaterThan(-1)
      expect(featuresStepIndex).toBe(2)
    })
  })
})

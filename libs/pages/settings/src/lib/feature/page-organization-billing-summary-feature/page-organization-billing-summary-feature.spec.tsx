import { IntercomProvider } from 'react-use-intercom'
import * as storeOrganization from '@qovery/domains/organization'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageOrganizationBillingSummaryFeature from './page-organization-billing-summary-feature'

import SpyInstance = jest.SpyInstance

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
}))

describe('PageOrganizationBillingSummaryFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <IntercomProvider appId="test">
        <PageOrganizationBillingSummaryFeature />
      </IntercomProvider>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should fetch credit card, clusters and organization costs', () => {
    const useCreditCardsSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useCreditCards')
    const fetchClustersSpy: SpyInstance = jest.spyOn(storeOrganization, 'fetchClusters')
    const useCurrentCostSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useCurrentCost')

    renderWithProviders(
      <IntercomProvider appId="test">
        <PageOrganizationBillingSummaryFeature />
      </IntercomProvider>
    )

    expect(useCreditCardsSpy).toHaveBeenCalled()
    expect(fetchClustersSpy).toHaveBeenCalled()
    expect(useCurrentCostSpy).toHaveBeenCalled()
  })
})

import { render } from '__tests__/utils/setup-jest'
import { IntercomProvider } from 'react-use-intercom'
import * as storeOrganization from '@qovery/domains/organization'
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
    const { baseElement } = render(
      <IntercomProvider appId="test">
        <PageOrganizationBillingSummaryFeature />
      </IntercomProvider>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should fetch credit card, clusters and organization costs', () => {
    const fetchCreditCardsSpy: SpyInstance = jest.spyOn(storeOrganization, 'fetchCreditCards')
    const fetchClustersSpy: SpyInstance = jest.spyOn(storeOrganization, 'fetchClusters')
    const fetchCurrentCostSpy: SpyInstance = jest.spyOn(storeOrganization, 'fetchCurrentCost')

    render(
      <IntercomProvider appId="test">
        <PageOrganizationBillingSummaryFeature />
      </IntercomProvider>
    )

    expect(fetchCreditCardsSpy).toHaveBeenCalled()
    expect(fetchClustersSpy).toHaveBeenCalled()
    expect(fetchCurrentCostSpy).toHaveBeenCalled()
  })
})

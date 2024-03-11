import { IntercomProvider } from 'react-use-intercom'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageOrganizationBillingSummaryFeature from './page-organization-billing-summary-feature'

import SpyInstance = jest.SpyInstance

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
    const useCurrentCostSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useCurrentCost')

    renderWithProviders(
      <IntercomProvider appId="test">
        <PageOrganizationBillingSummaryFeature />
      </IntercomProvider>
    )

    expect(useCreditCardsSpy).toHaveBeenCalled()
    expect(useCurrentCostSpy).toHaveBeenCalled()
  })
})

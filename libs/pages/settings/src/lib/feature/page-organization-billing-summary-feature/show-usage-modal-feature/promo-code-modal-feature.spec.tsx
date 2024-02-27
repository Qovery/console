import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { renderWithProviders } from '@qovery/shared/util-tests'
import ShowUsageModalFeature, { type ShowUsageModalFeatureProps } from './show-usage-modal-feature'

const useAddCreditCodeSpy = jest.spyOn(organizationsDomain, 'useAddCreditCode')

const props: ShowUsageModalFeatureProps = {
  closeModal: jest.fn(),
  organizationId: '1',
}

describe('ShowUsageModalFeature', () => {
  beforeEach(() => {
    useAddCreditCodeSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ShowUsageModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

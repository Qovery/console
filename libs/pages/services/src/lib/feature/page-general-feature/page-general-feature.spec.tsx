import { render } from '__tests__/utils/setup-jest'
import * as domainsServicesFeature from '@qovery/domains/services/feature'
import PageGeneralFeature from './page-general-feature'

describe('General', () => {
  it('should render successfully', () => {
    jest.spyOn(domainsServicesFeature, 'useListStatuses').mockReturnValue({
      data: {
        applications: [],
      },
    })
    const { baseElement } = render(<PageGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '__tests__/utils/setup-jest'
import { EnvironmentStatus } from 'qovery-typescript-axios'
import * as domainsEnvironmentsFeature from '@qovery/domains/environments/feature'
import PageGeneralFeature from './page-general-feature'

describe('PageGeneralFeature', () => {
  it('should render successfully', () => {
    jest.spyOn(domainsEnvironmentsFeature, 'useListStatuses').mockReturnValue({
      data: [] as EnvironmentStatus[],
    })
    const { baseElement } = render(<PageGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })
})

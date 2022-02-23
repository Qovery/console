import { render } from '__mocks__/utils/test-utils'

import PagesOverviewFeature from './overview-page'

describe('PagesOverviewFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PagesOverviewFeature />)
    expect(baseElement).toBeTruthy()
  })
})

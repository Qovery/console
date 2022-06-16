import { render } from '__tests__/utils/setup-jest'

import PageEnvironments from './page-environments'

describe('PagesEnvironments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageEnvironments />)
    expect(baseElement).toBeTruthy()
  })
})

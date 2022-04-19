import { render } from '__tests__/utils/setup-jest'

import ApplicationPage from './application-page'

describe('ApplicationPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ApplicationPage />)
    expect(baseElement).toBeTruthy()
  })
})

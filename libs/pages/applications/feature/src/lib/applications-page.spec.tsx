import { render } from '__tests__/utils/setup-jest'

import ApplicationsPage from './applications-page'

describe('ApplicationsPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ApplicationsPage />)
    expect(baseElement).toBeTruthy()
  })
})

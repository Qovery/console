import { render } from '__tests__/utils/setup-jest'

import TopBar from './top-bar'

describe('TopBar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TopBar />)
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '__tests__/utils/setup-jest'
import { NoBetaAccess } from './no-beta-access'

describe('NoBetaAccess', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NoBetaAccess />)

    expect(baseElement).toBeTruthy()
  })
})

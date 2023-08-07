import { render } from '__tests__/utils/setup-jest'
import WarningScreenMobile from './warning-screen-mobile'

describe('WarningScreenMobile', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WarningScreenMobile />)
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '@testing-library/react'

import WarningScreenMobile from './warning-screen-mobile'

describe('WarningScreenMobile', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WarningScreenMobile />)
    expect(baseElement).toBeTruthy()
  })
})

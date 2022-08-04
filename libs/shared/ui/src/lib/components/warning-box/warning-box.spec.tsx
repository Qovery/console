import { render } from '@testing-library/react'

import WarningBox from './warning-box'

describe('WarningBox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WarningBox message="Hello" />)
    expect(baseElement).toBeTruthy()
  })
})

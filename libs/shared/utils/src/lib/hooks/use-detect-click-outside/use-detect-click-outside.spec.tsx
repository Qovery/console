import { render } from '__tests__/utils/setup-jest'

import DetectClickOutside from './use-detect-click-outside'

describe('UseDetectOutside', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DetectClickOutside />)
    expect(baseElement).toBeTruthy()
  })
})

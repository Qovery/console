import { render } from '__mocks__/utils/test-utils'

import DetectClickOutside from './use-detect-click-outside'

describe('UseDetectOutside', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DetectClickOutside />)
    expect(baseElement).toBeTruthy()
  })
})

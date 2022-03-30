import { render } from '@testing-library/react'

import DetectClickOutside from './use-detect-click-outside'

describe('UseDetectOutside', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DetectClickOutside />)
    expect(baseElement).toBeTruthy()
  })
})

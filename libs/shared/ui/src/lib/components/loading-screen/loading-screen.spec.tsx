import { render } from '@testing-library/react'

import LoadingScreen from './loading-screen'

describe('LoadingScreen', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LoadingScreen />)
    expect(baseElement).toBeTruthy()
  })
})

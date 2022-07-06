import { render } from '@testing-library/react'

import NavigationLeft from './navigation-left'

describe('NavigationLeft', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NavigationLeft />)
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '@testing-library/react'

import PagesLoginFeature from './login-page'

describe('PagesLoginFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PagesLoginFeature />)
    expect(baseElement).toBeTruthy()
  })
})

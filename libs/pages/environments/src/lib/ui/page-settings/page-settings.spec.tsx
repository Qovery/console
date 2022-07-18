import { render } from '@testing-library/react'

import PageSettings from './page-settings'

describe('PageSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettings />)
    expect(baseElement).toBeTruthy()
  })
})

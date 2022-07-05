import { render } from '@testing-library/react'

import DomainsEnvironmentVariable from './domains-environment-variable'

describe('DomainsEnvironmentVariable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DomainsEnvironmentVariable />)
    expect(baseElement).toBeTruthy()
  })
})

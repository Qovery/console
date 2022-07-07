import { render } from '@testing-library/react'

import TabsFeature from './tabs-feature'

describe('TabsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TabsFeature />)
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '@testing-library/react'
import MenuAccountFeature from './menu-account-feature'

describe('MenuAccountFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MenuAccountFeature />)
    expect(baseElement).toBeTruthy()
  })
})

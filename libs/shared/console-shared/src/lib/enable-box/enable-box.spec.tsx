import { render } from '@testing-library/react'
import EnableBox from './enable-box'

describe('EnableBox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EnableBox />)
    expect(baseElement).toBeTruthy()
  })
})

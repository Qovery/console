import { render } from '@testing-library/react'
import CardNodeUsage from './card-node-usage'

describe('CardNodeUsage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CardNodeUsage />)
    expect(baseElement).toBeTruthy()
  })
})

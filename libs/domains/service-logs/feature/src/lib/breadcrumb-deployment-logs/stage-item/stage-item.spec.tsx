import { render } from '@testing-library/react'
import StageItem from './stage-item'

describe('StageItem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StageItem />)
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '@testing-library/react'
import RowEvent from './row-event'

describe('RowEvent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RowEvent />)
    expect(baseElement).toBeTruthy()
  })
})

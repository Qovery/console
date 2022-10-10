import { render } from '@testing-library/react'
import RowProject from './row-project'

describe('RowProject', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RowProject />)
    expect(baseElement).toBeTruthy()
  })
})

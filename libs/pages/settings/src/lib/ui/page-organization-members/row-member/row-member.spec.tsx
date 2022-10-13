import { render } from '@testing-library/react'
import RowMember from './row-member'

describe('RowMember', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RowMember />)
    expect(baseElement).toBeTruthy()
  })
})

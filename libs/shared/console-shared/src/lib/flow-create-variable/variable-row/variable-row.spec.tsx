import { render } from '@testing-library/react'
import VariableRow from './variable-row'

describe('VariableRow', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<VariableRow />)
    expect(baseElement).toBeTruthy()
  })
})

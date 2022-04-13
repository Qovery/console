import { render } from '__tests__/utils/setup-jest'
import { fireEvent, screen } from '@testing-library/react'

import InputSearch, { InputSearchProps } from './input-search'

let props: InputSearchProps

describe('InputSearch', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputSearch />)
    expect(baseElement).toBeTruthy()
  })

  it('should set the text value when the input event is emitted', async () => {
    render(<InputSearch {...props} />)

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'some new text value' } })

    expect((input as HTMLInputElement).value).toBe('some new text value')
  })
})

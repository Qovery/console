import { render, screen } from '__tests__/utils/setup-jest'
import { useState } from 'react'
import { act, renderWithProviders } from '@qovery/shared/util-tests'
import InputSearch, { type InputSearchProps } from './input-search'

let props: InputSearchProps

describe('InputSearch', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputSearch />)
    expect(baseElement).toBeTruthy()
  })

  it('should set the text value when the input event is emitted', async () => {
    const { userEvent } = renderWithProviders(<InputSearch {...props} />)

    const input = screen.getByRole('textbox')

    await userEvent.type(input, 'some new text value')

    expect(input).toHaveValue('some new text value')
  })

  it('follows default value changes', () => {
    const { rerender } = render(<InputSearch defaultValue="loki" />)

    rerender(<InputSearch defaultValue="envoy" />)
    expect(screen.getByRole('textbox')).toHaveValue('envoy')

    rerender(<InputSearch />)
    expect(screen.getByRole('textbox')).toHaveValue('')
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })

  it('shows the clear button when an empty search receives a default value', () => {
    const { rerender } = render(<InputSearch defaultValue="" />)

    rerender(<InputSearch defaultValue="loki" />)

    expect(screen.getByRole('textbox')).toHaveValue('loki')
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument()
  })

  it('keeps the typed value while focused', async () => {
    let setDefaultValue: (value: string) => void = () => undefined
    function InputSearchWithExternalValue() {
      const [defaultValue, setValue] = useState('lo')
      setDefaultValue = setValue
      return <InputSearch defaultValue={defaultValue} />
    }
    const { userEvent } = renderWithProviders(<InputSearchWithExternalValue />)
    const input = screen.getByRole('textbox')

    await userEvent.type(input, 'ki')
    act(() => setDefaultValue('lok'))

    expect(input).toHaveValue('loki')
  })
})

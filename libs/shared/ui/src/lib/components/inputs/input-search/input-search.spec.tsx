import { useState } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import InputSearch from './input-search'

describe('InputSearch', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<InputSearch />)
    expect(baseElement).toBeTruthy()
  })

  it('should set the text value when the input event is emitted', async () => {
    const { userEvent } = renderWithProviders(<InputSearch />)

    const input = screen.getByRole('textbox')

    await userEvent.type(input, 'some new text value')

    expect(input).toHaveValue('some new text value')
  })

  it('shows a controlled value with its clear button', () => {
    const { rerender } = renderWithProviders(<InputSearch value="loki" />)

    expect(screen.getByRole('textbox')).toHaveValue('loki')
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument()

    rerender(<InputSearch value="" />)

    expect(screen.getByRole('textbox')).toHaveValue('')
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })

  it('clears a controlled value through onChange', async () => {
    function ControlledInputSearch() {
      const [value, setValue] = useState('loki')
      return <InputSearch value={value} onChange={setValue} />
    }
    const { userEvent } = renderWithProviders(<ControlledInputSearch />)

    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(screen.getByRole('textbox')).toHaveValue('')
  })
})

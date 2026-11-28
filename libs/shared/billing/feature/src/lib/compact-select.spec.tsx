import { useState } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CompactSelect } from './compact-select'

const options = [
  { value: '', label: 'All organizations' },
  { value: 'northwind', label: 'Northwind' },
]

function Filter() {
  const [value, setValue] = useState('')
  return (
    <>
      <CompactSelect ariaLabel="Organization" value={value} onChange={setValue} options={options} />
      <button onClick={() => setValue('')}>Reset filters</button>
      <output aria-label="Selected organization">{value || 'all'}</output>
    </>
  )
}

describe('CompactSelect', () => {
  it('preserves focus when selecting and supports an external reset to all organizations', async () => {
    const { userEvent } = renderWithProviders(<Filter />)
    const select = screen.getByRole('combobox', { name: 'Organization' })
    await userEvent.tab()
    await userEvent.selectOptions(select, screen.getByRole('option', { name: 'Northwind' }))
    expect(select).toHaveFocus()
    expect(screen.getByLabelText('Selected organization')).toHaveTextContent('northwind')

    await userEvent.click(screen.getByRole('button', { name: 'Reset filters' }))
    expect((screen.getByRole('option', { name: 'All organizations' }) as HTMLOptionElement).selected).toBe(true)
    expect(screen.getByLabelText('Selected organization')).toHaveTextContent('all')
  })
})

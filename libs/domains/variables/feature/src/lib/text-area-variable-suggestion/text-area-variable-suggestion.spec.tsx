import { useState } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { TextAreaVariableSuggestion } from './text-area-variable-suggestion'

jest.mock('../dropdown-variable/dropdown-variable', () => ({
  __esModule: true,
  default: ({
    children,
    onChange,
    open,
    variableKeys,
  }: {
    children: JSX.Element
    onChange: (key: string) => void
    open?: boolean
    variableKeys?: string[]
  }) => (
    <div>
      {children}
      <span data-testid="dropdown-open">{String(open)}</span>
      <span data-testid="variable-keys">{variableKeys?.join(',')}</span>
      <button type="button" onClick={() => onChange('API_URL')}>
        Select API_URL
      </button>
    </div>
  ),
}))

function ControlledTextArea() {
  const [value, setValue] = useState('Call ')

  return (
    <>
      <TextAreaVariableSuggestion
        environmentId="environment-1"
        label="Agent prompt"
        name="agent-prompt"
        value={value}
        variableKeys={['LOCAL_TOKEN']}
        onChange={setValue}
      />
      <span data-testid="value">{value}</span>
    </>
  )
}

describe('TextAreaVariableSuggestion', () => {
  it('opens suggestions after typing opening braces and exposes local variables', async () => {
    const { userEvent } = renderWithProviders(<ControlledTextArea />)

    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.keyboard('{{{{')

    expect(screen.getByTestId('dropdown-open')).toHaveTextContent('true')
    expect(screen.getByTestId('variable-keys')).toHaveTextContent('LOCAL_TOKEN')
  })

  it('replaces opening braces with the selected variable macro', async () => {
    const { userEvent } = renderWithProviders(<ControlledTextArea />)

    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.keyboard('{{{{')
    await userEvent.click(screen.getByRole('button', { name: 'Select API_URL' }))

    expect(screen.getByTestId('value')).toHaveTextContent('Call {{API_URL}}')
  })
})

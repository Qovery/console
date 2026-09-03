import { useState } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowHeader } from './agentic-workflow-header'

function ControlledHeader({ nameError, onNameChange }: { nameError?: string; onNameChange?: (value: string) => void }) {
  const [name, setName] = useState('')
  return (
    <AgenticWorkflowHeader
      name={name}
      nameError={nameError}
      onNameChange={(value) => {
        setName(value)
        onNameChange?.(value)
      }}
    />
  )
}

describe('AgenticWorkflowHeader', () => {
  it('renders the name and focuses it on mount', () => {
    renderWithProviders(<AgenticWorkflowHeader name="My agent" onNameChange={jest.fn()} />)

    const input = screen.getByRole('textbox', { name: 'Name' })
    expect(input).toHaveValue('My agent')
    expect(input).toHaveFocus()
  })

  it('calls onNameChange when typing', async () => {
    const onNameChange = jest.fn()
    const { userEvent } = renderWithProviders(<ControlledHeader onNameChange={onNameChange} />)

    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Review agent')

    expect(onNameChange).toHaveBeenLastCalledWith('Review agent')
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Review agent')
  })

  it('associates the error message with the input', () => {
    renderWithProviders(<ControlledHeader nameError="Please enter an agent task name." />)

    const input = screen.getByRole('textbox', { name: 'Name' })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'agent-task-name-error')
    expect(screen.getByText('Please enter an agent task name.')).toHaveAttribute('id', 'agent-task-name-error')
  })
})

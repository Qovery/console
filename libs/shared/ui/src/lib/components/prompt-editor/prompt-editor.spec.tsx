import { createRef, useState } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PromptEditor, type PromptEditorHandle } from './prompt-editor'

describe('PromptEditor', () => {
  beforeAll(() => {
    Range.prototype.getClientRects = jest.fn(() => [] as unknown as DOMRectList)
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0)
  })

  it('should expose a controlled plain-text editor', async () => {
    const onChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <PromptEditor label="Prompt" name="prompt" value="Review" onChange={onChange} />
    )

    await userEvent.type(screen.getByRole('textbox', { name: 'Prompt' }), ' changes')

    expect(onChange).toHaveBeenLastCalledWith(' changesReview', { cursor: 8 })
  })

  it('should insert text at the current selection through its handle', () => {
    const onChange = jest.fn()
    const ref = createRef<PromptEditorHandle>()
    renderWithProviders(<PromptEditor ref={ref} label="Prompt" name="prompt" value="Notify " onChange={onChange} />)

    ref.current?.insertText('{{TEAM}}')

    expect(onChange).toHaveBeenLastCalledWith('{{TEAM}}Notify ', { cursor: 8 })
    expect(screen.getByRole('textbox', { name: 'Prompt' })).toHaveFocus()
  })

  it('should connect validation feedback to the editor', () => {
    renderWithProviders(
      <PromptEditor label="Prompt" name="prompt" value="" error="Please enter a prompt." onChange={jest.fn()} />
    )

    expect(screen.getByRole('textbox', { name: 'Prompt' })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Please enter a prompt.')).toBeInTheDocument()
  })

  it('should omit aria-describedby when no feedback is rendered', () => {
    renderWithProviders(<PromptEditor label="Prompt" name="prompt" value="" onChange={jest.fn()} />)

    expect(screen.getByRole('textbox', { name: 'Prompt' })).not.toHaveAttribute('aria-describedby')
  })

  it('should preserve editor text when feedback changes', async () => {
    function ControlledPromptEditor() {
      const [error, setError] = useState<string>()
      const [value, setValue] = useState('Review')

      return (
        <>
          <PromptEditor
            label="Prompt"
            name="prompt"
            value={value}
            error={error}
            onChange={(nextValue) => setValue(nextValue)}
          />
          <button type="button" onClick={() => setError('Invalid prompt.')}>
            Show error
          </button>
        </>
      )
    }

    const { userEvent } = renderWithProviders(<ControlledPromptEditor />)

    await userEvent.type(screen.getByRole('textbox', { name: 'Prompt' }), ' changes')
    await userEvent.click(screen.getByRole('button', { name: 'Show error' }))

    expect(screen.getByRole('textbox', { name: 'Prompt' })).toHaveTextContent('changesReview')
  })

  it('should not report a controlled value synchronization as a user edit', () => {
    const onChange = jest.fn()
    const { rerender } = renderWithProviders(
      <PromptEditor label="Prompt" name="prompt" value="Review" onChange={onChange} />
    )

    rerender(<PromptEditor label="Prompt" name="prompt" value="Updated" onChange={onChange} />)

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: 'Prompt' })).toHaveTextContent('Updated')
  })
})

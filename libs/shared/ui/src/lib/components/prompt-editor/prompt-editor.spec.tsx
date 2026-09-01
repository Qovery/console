import { createRef } from 'react'
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
})

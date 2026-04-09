import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import { VariableValueEditorModal, getValueEditorLanguage } from './variable-value-editor-modal'

jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')

  return {
    ...actual,
    CodeEditor: ({ value, onChange }: { value?: string | null; onChange?: (value: string) => void }) => (
      <textarea
        data-testid="mock-code-editor"
        value={value ?? ''}
        onChange={(event) => onChange?.(event.target.value)}
      />
    ),
  }
})

jest.mock('../../code-editor-variable/code-editor-variable', () => ({
  CodeEditorVariable: ({ value, onChange }: { value?: string | null; onChange: (value: string) => void }) => (
    <textarea
      data-testid="mock-code-editor-variable"
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}))

describe('VariableValueEditorModal', () => {
  it('should save the edited value and close the modal', async () => {
    const onSave = jest.fn()
    const onOpenChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <VariableValueEditorModal
        open={true}
        onOpenChange={onOpenChange}
        onSave={onSave}
        value="initial value"
        title="Value editor"
        description="Edit the value in a larger editor."
        language="plaintext"
        environmentId="environment-id"
      />
    )

    await screen.findByTestId('submit-button')
    await userEvent.clear(screen.getByTestId('mock-code-editor-variable'))
    await userEvent.type(screen.getByTestId('mock-code-editor-variable'), 'updated value')

    const fullscreenEditor = screen.getByTestId('value-full-screen-editor')
    await userEvent.click(within(fullscreenEditor).getByTestId('submit-button'))

    expect(onSave).toHaveBeenCalledWith('updated value')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should close without saving when cancelling', async () => {
    const onSave = jest.fn()
    const onOpenChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <VariableValueEditorModal
        open={true}
        onOpenChange={onOpenChange}
        onSave={onSave}
        value="initial value"
        title="Value editor"
        description="Edit the value in a larger editor."
        language="plaintext"
        environmentId="environment-id"
      />
    )

    await screen.findByTestId('cancel-button')
    const fullscreenEditor = screen.getByTestId('value-full-screen-editor')
    await userEvent.click(within(fullscreenEditor).getByRole('button', { name: /^cancel$/i }))

    expect(onSave).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should render the variable code editor when environment context is provided', async () => {
    renderWithProviders(
      <VariableValueEditorModal
        open={true}
        onOpenChange={jest.fn()}
        onSave={jest.fn()}
        value="initial value"
        title="Value editor"
        description="Edit the value in a larger editor."
        language="yaml"
        environmentId="environment-id"
        serviceId="service-id"
        scope="APPLICATION"
      />
    )

    await screen.findByTestId('submit-button')
    expect(screen.getByTestId('mock-code-editor-variable')).toBeInTheDocument()
  })

  it('should render the plain code editor when no environment context is provided', async () => {
    renderWithProviders(
      <VariableValueEditorModal
        open={true}
        onOpenChange={jest.fn()}
        onSave={jest.fn()}
        value="initial value"
        title="Value editor"
        description="Edit the value in a larger editor."
        language="plaintext"
      />
    )

    await screen.findByTestId('submit-button')
    expect(screen.getByTestId('mock-code-editor')).toBeInTheDocument()
  })
})

describe('getValueEditorLanguage', () => {
  it('should return yaml for yaml files', () => {
    expect(getValueEditorLanguage({ isFile: true, mountPath: '/etc/config.yaml' })).toBe('yaml')
    expect(getValueEditorLanguage({ isFile: true, mountPath: '/etc/config.yml' })).toBe('yaml')
  })

  it('should return json for json files', () => {
    expect(getValueEditorLanguage({ isFile: true, mountPath: '/etc/config.json' })).toBe('json')
  })

  it('should return plaintext for non file values or unknown extensions', () => {
    expect(getValueEditorLanguage({ isFile: false, mountPath: '/etc/config.yaml' })).toBe('plaintext')
    expect(getValueEditorLanguage({ isFile: true, mountPath: '/etc/config.txt' })).toBe('plaintext')
    expect(getValueEditorLanguage({ isFile: true })).toBe('plaintext')
  })
})

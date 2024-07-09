import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import EntrypointCmdInputs, { displayParsedCmd } from './entrypoint-cmd-inputs'

describe('EntrypointCmdInputs', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<EntrypointCmdInputs />))
    screen.getByTestId('input-text-image-entry-point')
    screen.getByTestId('input-textarea-cmd-arguments')
    expect(baseElement).toBeTruthy()
  })
})

describe('displayParsedCmd', () => {
  it('simple command without special characters', () => {
    const cmd = 'docker run --entrypoint test image-name arg1 arg2'
    expect(displayParsedCmd(cmd)).toBe('docker run --entrypoint test image-name arg1 arg2')
  })

  it('command with argument requiring quotes', () => {
    const cmd = 'docker run --entrypoint test image-name "arg with spaces"'
    expect(displayParsedCmd(cmd)).toBe('docker run --entrypoint test image-name "arg with spaces"')
  })

  it('command with comment', () => {
    const cmd = 'docker run --entrypoint test image-name arg1 arg2 # comment'
    expect(displayParsedCmd(cmd)).toBe('docker run --entrypoint test image-name arg1 arg2 # comment')
  })

  it('command with special operator', () => {
    const cmd = 'docker run --entrypoint test image-name arg1 arg2 ||'
    expect(displayParsedCmd(cmd)).toBe('docker run --entrypoint test image-name arg1 arg2 ||')
  })
})

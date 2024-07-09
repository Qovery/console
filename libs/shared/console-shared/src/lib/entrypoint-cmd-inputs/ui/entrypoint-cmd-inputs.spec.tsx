import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { joinArgsWithQuotes } from '@qovery/shared/util-js'
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

describe('joinArgsWithQuotes', () => {
  it('should handle single word arguments correctly', () => {
    const input = ['arg1', 'arg2']
    const expected = 'arg1 arg2'
    expect(joinArgsWithQuotes(input)).toBe(expected)
  })

  it('should handle arguments with multiple words correctly', () => {
    const input = ['arg1', 'arg3 arg4']
    const expected = 'arg1 "arg3 arg4"'
    expect(joinArgsWithQuotes(input)).toBe(expected)
  })

  it('should handle arguments starting with # correctly', () => {
    const input = ['arg1', '# hello world 123']
    const expected = 'arg1 # hello world 123'
    expect(joinArgsWithQuotes(input)).toBe(expected)
  })

  it('should handle mixed arguments correctly', () => {
    const input = ['arg2', 'arg3 arg4', '# test test test']
    const expected = 'arg2 "arg3 arg4" # test test test'
    expect(joinArgsWithQuotes(input)).toBe(expected)
  })

  it('should handle multiple words starting with # correctly', () => {
    const input = ['# singleword', 'multiple words here']
    const expected = '# singleword "multiple words here"'
    expect(joinArgsWithQuotes(input)).toBe(expected)
  })
})

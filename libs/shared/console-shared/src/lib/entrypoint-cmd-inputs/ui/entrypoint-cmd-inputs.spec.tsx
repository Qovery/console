import { getByTestId, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import EntrypointCmdInputs, { formattedCmdArguments } from './entrypoint-cmd-inputs'

describe('EntrypointCmdInputs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<EntrypointCmdInputs />))
    getByTestId(baseElement, 'input-text-image-entry-point')
    getByTestId(baseElement, 'input-textarea-cmd-arguments')
    expect(baseElement).toBeTruthy()
  })

  it('should return an array with quotes removed from valid string array', () => {
    const stringArray = '["element1", "element2", "element3"]'
    const result = formattedCmdArguments(stringArray)
    expect(result).toEqual([' element1 ', ' element2 ', ' element3 '])
  })

  it('should return null for an invalid string array', () => {
    const stringArray = 'invalidArray'
    const result = formattedCmdArguments(stringArray)
    expect(result).toBeNull()
  })

  it('should handle leading and trailing whitespaces and remove quotes', () => {
    const stringArray = '  ["element1", "element2", "element3"]  '
    const result = formattedCmdArguments(stringArray)
    expect(result).toEqual([' element1 ', ' element2 ', ' element3 '])
  })
})

import { getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
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

  it('displays formatted CMD arguments when isContainer is true and inputs have values', () => {
    jest.mock('react-hook-form', () => ({
      ...jest.requireActual('react-hook-form'),
      useFormContext: jest.fn(),
    }))

    useFormContext.mockReturnValue({
      control: {},
      watch: jest.fn().mockReturnValue(''),
    })

    useFormContext.mockReturnValueOnce({
      control: {},
      watch: jest.fn().mockImplementation((field) => {
        if (field === 'image_name') return 'myapp'
        if (field === 'image_tag') return 'v1.0'
        if (field === 'image_entry_point') return 'start'
        if (field === 'cmd_arguments') return '["-h", "0.0.0.0", "-p", "8080", "string"]'
        return ''
      }),
    })

    render(wrapWithReactHookForm(<EntrypointCmdInputs isContainer={true} />))

    expect(screen.getByText('i.e: docker run -e start myapp:v1.0 -h 0.0.0.0 -p 8080 string')).toBeInTheDocument()
  })
})

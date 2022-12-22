import { getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import EntrypointCmdInputs from './entrypoint-cmd-inputs'

describe('EntrypointCmdInputs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<EntrypointCmdInputs />))
    getByTestId(baseElement, 'input-text-image-entry-point')
    getByTestId(baseElement, 'input-textarea-cmd-arguments')
    expect(baseElement).toBeTruthy()
  })
})

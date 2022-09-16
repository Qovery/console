import { getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import PageApplicationCreateGeneralContainer from './page-application-create-general-container'

describe('PageApplicationCreateGeneralContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageApplicationCreateGeneralContainer />))
    expect(baseElement).toBeTruthy()
  })

  it('should render five inputs', () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageApplicationCreateGeneralContainer />))
    getByTestId(baseElement, 'input-select-registry')
    getByTestId(baseElement, 'input-text-image-name')
    getByTestId(baseElement, 'input-text-image-tag')
    getByTestId(baseElement, 'input-text-image-entry-point')
    getByTestId(baseElement, 'input-textarea-cmd-arguments')
  })
})

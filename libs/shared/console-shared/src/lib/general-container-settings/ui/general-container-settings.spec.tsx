import { getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import GeneralContainerSettings from './general-container-settings'

describe('CreateGeneralContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<GeneralContainerSettings />))
    expect(baseElement).toBeTruthy()
  })

  it('should render five inputs', () => {
    const { baseElement } = render(wrapWithReactHookForm(<GeneralContainerSettings />))
    getByTestId(baseElement, 'input-select-registry')
    getByTestId(baseElement, 'input-text-image-name')
    getByTestId(baseElement, 'input-text-image-tag')
  })
})

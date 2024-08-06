import { renderWithProviders } from '@qovery/shared/util-tests'
import { CodeEditorVariables } from './code-editor-variables'

describe('CodeEditorVariables', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<CodeEditorVariables environmentId="000" />)
    expect(baseElement).toBeTruthy()
  })
})

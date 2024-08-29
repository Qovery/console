import { renderWithProviders } from '@qovery/shared/util-tests'
import { CodeEditorVariable } from './code-editor-variable'

describe('CodeEditorVariable', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<CodeEditorVariable environmentId="000" />)
    expect(baseElement).toBeTruthy()
  })
})

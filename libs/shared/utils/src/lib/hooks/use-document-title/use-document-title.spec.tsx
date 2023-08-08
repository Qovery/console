import { renderHook } from '__tests__/utils/setup-jest'
import useDocumentTitle from './use-document-title'

describe('UseDocumentTitle', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useDocumentTitle('some page title'))

    expect(result).toBeTruthy()
  })

  it('should set the document title', () => {
    renderHook(() => useDocumentTitle('some page title'))

    expect(document.title).toBe('some page title')
  })
})

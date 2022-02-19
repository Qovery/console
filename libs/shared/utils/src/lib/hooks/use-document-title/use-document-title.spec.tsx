import { render } from '@testing-library/react'

import UseDocumentTitle from './use-document-title'

describe('UseDocumentTitle', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UseDocumentTitle />)
    expect(baseElement).toBeTruthy()
  })
})

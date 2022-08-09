import { render } from '@testing-library/react'

import StorageModalFeature from './storage-modal-feature'

describe('StorageModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StorageModalFeature />)
    expect(baseElement).toBeTruthy()
  })
})

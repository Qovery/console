import { render } from '@testing-library/react'

import StorageModal from './storage-modal'

describe('StorageModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StorageModal />)
    expect(baseElement).toBeTruthy()
  })
})

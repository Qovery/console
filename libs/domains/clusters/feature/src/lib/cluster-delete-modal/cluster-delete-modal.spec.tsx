import { render } from '@testing-library/react'
import ClusterDeleteModal from './cluster-delete-modal'

describe('ClusterDeleteModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ClusterDeleteModal />)
    expect(baseElement).toBeTruthy()
  })
})

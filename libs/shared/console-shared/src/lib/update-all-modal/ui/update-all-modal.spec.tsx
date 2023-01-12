import { render } from '@testing-library/react'
import UpdateAllModal from './update-all-modal'

describe('UpdateAllModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UpdateAllModal />)
    expect(baseElement).toBeTruthy()
  })
})

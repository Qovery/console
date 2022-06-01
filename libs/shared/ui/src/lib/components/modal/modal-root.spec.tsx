import { render } from '@testing-library/react'

import ModalRoot from './modal-root'

describe('ModalRoot', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ModalRoot />)
    expect(baseElement).toBeTruthy()
  })
})

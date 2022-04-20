import { render } from '@testing-library/react'

import ModalUser from './modal-user'

describe('ModalUser', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ModalUser />)
    expect(baseElement).toBeTruthy()
  })
})

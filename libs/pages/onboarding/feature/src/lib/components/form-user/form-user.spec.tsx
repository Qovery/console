import { render } from '@testing-library/react'

import FormUser from './form-user'

describe('FormUser', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FormUser />)
    expect(baseElement).toBeTruthy()
  })
})

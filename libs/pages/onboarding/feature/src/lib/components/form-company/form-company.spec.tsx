import { render } from '@testing-library/react'

import FormCompany from './form-company'

describe('FormCompany', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FormCompany />)
    expect(baseElement).toBeTruthy()
  })
})

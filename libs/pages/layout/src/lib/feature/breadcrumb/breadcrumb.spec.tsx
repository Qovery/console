import { render } from '@testing-library/react'

import Breadcrumb from './breadcrumb'

describe('Breadcrumb', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Breadcrumb />)
    expect(baseElement).toBeTruthy()
  })
})

import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '__tests__/test-utils'

import LayoutPage from './layout-page'

describe('LayoutPage', () => {
  it('should render successfully', () => {
    const children = React.createElement('div')

    const { baseElement } = render(<LayoutPage children={children} />, { wrapper: MemoryRouter })

    expect(baseElement).toBeTruthy()
  })
})

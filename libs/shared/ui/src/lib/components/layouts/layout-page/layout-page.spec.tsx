import LayoutPage from './layout-page'
import { render } from '__mocks__/utils/test-utils'
import React from 'react'

describe('LayoutPage', () => {
  it('should render successfully', () => {
    const children = React.createElement('div')

    const { baseElement } = render(<LayoutPage children={children} />)
    expect(baseElement).toBeTruthy()
  })
})

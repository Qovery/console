import LayoutPage from './layout-page'
import { render } from '__tests__/utils/setup-jest'
import React from 'react'

describe('LayoutPage', () => {
  it('should render successfully', () => {
    const children = React.createElement('div')

    const { baseElement } = render(<LayoutPage children={children} />)
    expect(baseElement).toBeTruthy()
  })
})

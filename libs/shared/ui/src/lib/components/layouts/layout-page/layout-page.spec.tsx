import LayoutPage from './layout-page'
import { renderWithRouter } from '__mocks__/utils/test-utils'
import React from 'react'

describe('LayoutPage', () => {
  it('should render successfully', () => {
    const children = React.createElement('div')

    const { baseElement } = renderWithRouter(<LayoutPage children={children} />)
    expect(baseElement).toBeTruthy()
  })
})

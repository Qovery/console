import { render } from '__tests__/utils/setup-jest'
import { createElement } from 'react'
import LayoutLogin from './layout-login'

describe('LayoutLogin', () => {
  it('should render successfully', () => {
    const children = createElement('div')
    const { baseElement } = render(<LayoutLogin children={children} />)
    expect(baseElement).toBeTruthy()
  })
})

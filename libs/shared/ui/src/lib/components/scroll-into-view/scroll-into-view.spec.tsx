import ScrollIntoView from './scroll-into-view'
import { render } from '__tests__/utils/setup-jest'

describe('ScrollIntoView', () => {
  it('should render successfully', () => {
    Element.prototype.scrollIntoView = jest.fn()
    const { baseElement } = render(<ScrollIntoView />)
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '__tests__/utils/setup-jest'
import ScrollIntoView from './scroll-into-view'

describe('ScrollIntoView', () => {
  it('should render successfully', () => {
    Element.prototype.scrollIntoView = jest.fn()
    const { baseElement } = render(<ScrollIntoView />)
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
    expect(baseElement).toBeTruthy()
  })
})

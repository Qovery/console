import { getByTestId, getByText, render } from '__tests__/utils/setup-jest'
import BreadcrumbItemValue, { type BreadcrumbItemValueProps } from './breadcrumb-item-value'

const props: BreadcrumbItemValueProps = {
  name: 'Test',
  link: '/test',
  active: false,
}

describe('BreadcrumbItemValue', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BreadcrumbItemValue {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the logo', () => {
    const { baseElement } = render(
      <BreadcrumbItemValue {...props} logo={<img src="" alt="hey" data-testid="logo" />} />
    )
    getByTestId(baseElement, 'logo')
  })

  it('should render the item with active classes', () => {
    const { baseElement } = render(<BreadcrumbItemValue {...props} active />)
    const item = getByTestId(baseElement, 'breadcrumb-item-value')
    expect(item).toHaveClass('text-neutral-400')
  })

  it('should render the item with not active classes', () => {
    const { baseElement } = render(<BreadcrumbItemValue {...props} active={false} />)
    const item = getByTestId(baseElement, 'breadcrumb-item-value')
    expect(item).toHaveClass('text-neutral-400 hover:bg-neutral-150 active:bg-neutral-200')
  })

  it('should render the display text', () => {
    const longName = `A very long display text that is over 50 characters and that we want to shorten`
    const truncated = longName.slice(0, 50) + '...'
    const { baseElement } = render(<BreadcrumbItemValue {...props} name={longName} />)

    getByText(baseElement, truncated)
  })
})

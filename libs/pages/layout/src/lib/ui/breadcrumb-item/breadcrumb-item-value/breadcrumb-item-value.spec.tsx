import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import BreadcrumbItemValue, { type BreadcrumbItemValueProps } from './breadcrumb-item-value'

const props: BreadcrumbItemValueProps = {
  name: 'Test',
  link: '/test',
  active: false,
}

describe('BreadcrumbItemValue', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<BreadcrumbItemValue {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the logo', () => {
    renderWithProviders(<BreadcrumbItemValue {...props} logo={<img src="" alt="hey" data-testid="logo" />} />)
    screen.getByTestId('logo')
  })

  it('should render the item with active classes', () => {
    renderWithProviders(<BreadcrumbItemValue {...props} active />)
    const item = screen.getByTestId('breadcrumb-item-value')
    expect(item).toHaveClass('text-neutral-400')
  })

  it('should render the item with not active classes', () => {
    renderWithProviders(<BreadcrumbItemValue {...props} active={false} />)
    const item = screen.getByTestId('breadcrumb-item-value')
    expect(item).toHaveClass('text-neutral-400 hover:bg-neutral-150 active:bg-neutral-200')
  })

  it('should render the display text', () => {
    const longName = `A very long display text that is over 50 characters and that we want to shorten`
    const truncated = longName.slice(0, 50) + '...'
    renderWithProviders(<BreadcrumbItemValue {...props} name={longName} />)

    screen.getByText(truncated)
  })
})

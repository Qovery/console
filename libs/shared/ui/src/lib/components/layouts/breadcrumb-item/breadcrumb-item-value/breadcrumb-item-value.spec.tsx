import { render } from '__tests__/utils/setup-jest'
import BreadcrumbItemValue, { BreadcrumbItemValueProps } from './breadcrumb-item-value'

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
})

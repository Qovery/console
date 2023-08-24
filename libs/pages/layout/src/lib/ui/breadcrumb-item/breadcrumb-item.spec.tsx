import { render } from '__tests__/utils/setup-jest'
import BreadcrumbItem, { type BreadcrumbItemProps } from './breadcrumb-item'

describe('BreadcrumbItem', () => {
  const props: BreadcrumbItemProps = {
    data: [],
    paramId: 'ffff-ffff-ffff',
    link: '/overview',
    menuItems: [
      {
        items: [
          {
            name: 'Test 1',
            link: {
              url: '/',
            },
          },
        ],
      },
    ],
  }
  it('should render successfully', () => {
    const { baseElement } = render(<BreadcrumbItem {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

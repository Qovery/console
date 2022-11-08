import { render } from '__tests__/utils/setup-jest'
import { BreadcrumbItemProps } from '@qovery/shared/ui'
import BreadcrumbItem from './breadcrumb-item'

describe('BreadcrumbItem', () => {
  let props: BreadcrumbItemProps = {
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

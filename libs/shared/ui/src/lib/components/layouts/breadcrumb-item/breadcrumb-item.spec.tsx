import { screen } from '@testing-library/react'
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

  it('should have a name get by the paramId', () => {
    props.paramId = 'ffff-ffff-ffff'
    props.data = [
      {
        id: 'ffff-ffff-ffff',
        name: 'my data name',
      },
    ]

    render(<BreadcrumbItem {...props} />)

    const label = screen.getByTestId('label')

    expect(label?.textContent).toBe('my data name')
  })
})

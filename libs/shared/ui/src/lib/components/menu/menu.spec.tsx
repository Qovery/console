import { screen } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import Button from '../buttons/button/button'
import Icon from '../icon/icon'
import { Menu, MenuDirection, MenuProps } from './menu'

let props: MenuProps

beforeEach(() => {
  props = {
    trigger: <Button>Test menu</Button>,
    children: <p>Contenu du menu</p>,
    menus: [
      {
        items: [
          {
            name: 'Test 1',
            link: {
              url: '/',
            },
          },
          {
            name: 'Test 2',
            link: {
              url: '/',
            },
          },
          {
            name: 'Test 3',
            link: {
              url: '/',
            },
          },
        ],
        title: 'Test',
        button: 'Link',
        buttonLink: '/',
      },
      {
        items: [
          {
            name: 'Test 4',
            link: {
              url: '/',
            },
          },
          {
            name: 'Test 5',
            link: {
              url: '/',
            },
          },
          {
            name: 'Test 6',
            link: {
              url: '/',
            },
          },
        ],
      },
    ],
  }
})

describe('Menu', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Menu {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should be open by default', () => {
    props.open = true

    render(<Menu {...props} />)

    const menu = screen.getByRole('menu')

    expect(menu).toBeTruthy()
  })

  it('should have an accurate direction', () => {
    props.open = true
    props.direction = MenuDirection.RIGHT

    render(<Menu {...props} />)

    const menu = screen.getByRole('menu')

    expect(menu.classList.contains('szh-menu--dir-right')).toBe(true)
  })

  it('should have accurate classname', () => {
    props.open = true
    props.className = 'some-class-name'

    render(<Menu {...props} />)

    const menu = screen.getByRole('menu')

    expect(menu.classList.contains('some-class-name')).toBe(true)
  })

  it('should an item have an icon', () => {
    props.menus = [
      {
        items: [
          {
            name: 'Test 1',
            link: {
              url: '/',
            },
            contentLeft: <Icon name="icon-solid-layer-group" />,
          },
        ],
      },
    ]

    render(<Menu {...props} />)

    const item = screen.getByTestId('menu-icon')

    expect(item).toBeTruthy()
  })

  it('should have a search input on menu', () => {
    props.menus = [
      {
        items: [
          {
            name: 'Test 1',
            link: {
              url: '/',
            },
            contentLeft: <Icon name="icon-solid-layer-group" />,
          },
        ],
        search: true,
      },
    ]

    render(<Menu {...props} />)

    const search = screen.getByTestId('menu-search')

    expect(search).toBeTruthy()
  })

  it('should have a custom content on menu', () => {
    props.menus = [
      {
        items: [
          {
            name: 'Test 1',
            itemContentCustom: <p>hello</p>,
          },
        ],
        search: true,
      },
    ]

    render(<Menu {...props} />)

    const menu = screen.getByTestId('menuItem')
    expect(menu.textContent).toBe('hello')
  })
})

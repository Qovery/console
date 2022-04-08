import { render } from '__tests__/utils/setup-jest'
import { screen } from '@testing-library/react'
import { Menu, MenuDirection, MenuProps } from './menu'
import Button from '../buttons/button/button'
import Icon from '../icon/icon'

let props: MenuProps

beforeEach(() => {
  props = {
    trigger: <Button>Test menu</Button>,
    children: <p>Contenu du menu</p>,
    menus: [
      {
        items: [
          { name: 'Test 1', link: '/' },
          { name: 'Test 2', link: '/' },
          { name: 'Test 3', link: '/' },
        ],
        title: 'Test',
        button: 'Link',
        buttonLink: '/',
      },
      {
        items: [
          { name: 'Test 4', link: '/' },
          { name: 'Test 5', link: '/' },
          { name: 'Test 6', link: '/' },
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

  it('shold be open by default', () => {
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
        items: [{ name: 'Test 1', link: '/', iconLeft: <Icon name="icon-solid-layer-group" /> }],
      },
    ]

    render(<Menu {...props} />)

    const item = screen.getByRole('img')

    expect(item).toBeTruthy()
  })
})

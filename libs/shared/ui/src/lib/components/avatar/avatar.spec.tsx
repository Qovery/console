import { IconEnum } from '@console/shared/enums'
import { render, screen } from '@testing-library/react'
import { Chance } from 'chance'

import { Avatar, AvatarProps } from './avatar'

let props: AvatarProps

const chance = new Chance()

let container

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

describe('Avatar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Avatar {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply the accurate classes', () => {
    props.className = 'some-class-name'

    const rendered = render(<Avatar {...props} />)

    const avatar = rendered.container.querySelector('div')

    expect(avatar?.classList.contains('some-class-name')).toBe(true)
  })

  it('should have an icon', () => {
    props.icon = IconEnum.GITHUB

    const rendered = render(<Avatar {...props} />)

    const icon = rendered.container.querySelector('div svg')

    expect(icon).toBeTruthy()
  })

  it('shoud have a link', () => {
    props.link = chance.url()

    render(<Avatar {...props} />)

    const link = screen.getByRole('link')

    expect(link).toBeTruthy()
  })
})

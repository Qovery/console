import { IconEnum } from '@console/shared/enums'
import { render } from '__tests__/utils/setup-jest'
import { screen } from '@testing-library/react'
import { Chance } from 'chance'

import { Avatar, AvatarProps } from './avatar'

let props: AvatarProps

const chance = new Chance()

let container

beforeEach(() => {
  props = {
    firstName: 'Rémi',
    lastName: 'Bonnet',
  }
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

    render(<Avatar {...props} />)

    const avatar = screen.getByTestId('avatar')

    expect(avatar?.classList.contains('some-class-name')).toBe(true)
  })

  it('should have an icon', () => {
    props.icon = IconEnum.GITHUB

    render(<Avatar {...props} />)

    const icon = screen.getByTestId('avatar-icon')

    expect(icon).toBeTruthy()
  })
})

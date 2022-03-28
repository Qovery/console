import { IconEnum } from '@console/shared/enums'
import { render } from '__tests__/utils/setup-jest'
import { screen } from '@testing-library/react'
import { Chance } from 'chance'

import { Avatar, AvatarProps, AvatarStyle } from './avatar'

const props: AvatarProps = {
  url: ''
}

const chance = new Chance()

let container: any;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

describe('Avatar', () => {

  it('should render successfully', () => {
    const { baseElement } = render(<Avatar {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply the accurate classes', () => {
    props.style = AvatarStyle.NORMAL
    props.className = 'some-class-name'

    const rendered = render(<Avatar {...props} />)

    const avatar = rendered.container.querySelector('div')

    expect(avatar?.className).toBe('avatar avatar--normal some-class-name')
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

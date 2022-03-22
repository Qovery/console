import { render, screen } from '@testing-library/react'
import { Chance } from 'chance'
import { BrowserRouter } from 'react-router-dom'

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

  it('shoud have a link', () => {
    props.link = chance.url()

    render(
      <BrowserRouter>
        <Avatar {...props} />
      </BrowserRouter>
    )

    const link = screen.getByRole('link')

    expect(link).toBeTruthy()
  })
})

import { type ComponentPropsWithoutRef } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import Container from './container'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  Link: ({ to, children, ...props }: ComponentPropsWithoutRef<'a'> & { to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

describe('Container', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())
  it('renders the profile shell with the account menu and no funnel header', () => {
    renderWithProviders(
      <Container userMenu={<button>User menu</button>}>
        <p>Profile form</p>
      </Container>
    )

    expect(screen.getByRole('img', { name: 'Qovery' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Qovery home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('button', { name: 'User menu' })).toBeInTheDocument()
    expect(screen.queryByTestId('progress-bar-wrapper')).not.toBeInTheDocument()
  })
})

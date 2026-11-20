import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { Sidebar } from './sidebar'

let mockPathname = '/general'

jest.mock('@tanstack/react-router', () => {
  const React = jest.requireActual('react')
  return {
    ...jest.requireActual('@tanstack/react-router'),
    useRouterState: () => ({
      location: {
        pathname: mockPathname,
      },
    }),
    Link: React.forwardRef(
      (
        { children, to, ...props }: { children?: React.ReactNode; to?: string; [key: string]: unknown },
        ref: React.Ref<HTMLAnchorElement>
      ) => React.createElement('a', { ref, href: to, ...props }, children)
    ),
  }
})

describe('Sidebar', () => {
  beforeEach(() => {
    mockPathname = '/general'
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <Sidebar.Root>
        <Sidebar.Item to="/general">General</Sidebar.Item>
      </Sidebar.Root>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render item with icon', () => {
    renderWithProviders(
      <Sidebar.Root>
        <Sidebar.Item to="/general" icon="gear">
          General
        </Sidebar.Item>
      </Sidebar.Root>
    )

    expect(screen.getByRole('link', { name: 'General' })).toBeInTheDocument()
  })

  it('should mark active item', () => {
    renderWithProviders(
      <Sidebar.Root>
        <Sidebar.Item to="/general">General</Sidebar.Item>
        <Sidebar.Item to="/deployment">Deployment</Sidebar.Item>
      </Sidebar.Root>
    )

    const generalItem = screen.getByRole('link', { name: 'General' })
    expect(generalItem).toHaveAttribute('data-active', 'true')
    expect(generalItem).toHaveAttribute('aria-current', 'page')
  })

  it('should show the current section in the mobile menu button and expand the list on click', async () => {
    const { userEvent } = renderWithProviders(
      <Sidebar.Root>
        <Sidebar.Item to="/general">General</Sidebar.Item>
        <Sidebar.Item to="/deployment">Deployment</Sidebar.Item>
      </Sidebar.Root>
    )

    const menuButton = screen.getByRole('button', { name: 'General' })
    const list = document.getElementById(menuButton.getAttribute('aria-controls') ?? '')
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(list).toHaveClass('max-md:hidden')

    await userEvent.click(menuButton)

    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(list).not.toHaveClass('max-md:hidden')
  })

  it('should leave the badge out of the mobile menu button label', () => {
    mockPathname = '/issues'
    renderWithProviders(
      <Sidebar.Root>
        <Sidebar.Item to="/issues" badge="3">
          Issues
        </Sidebar.Item>
      </Sidebar.Root>
    )

    expect(screen.getByRole('button', { name: 'Issues' })).toBeInTheDocument()
  })

  it('should move between links with arrow keys without stopping on the mobile menu button', async () => {
    const { userEvent } = renderWithProviders(
      <Sidebar.Root>
        <Sidebar.Item to="/general">General</Sidebar.Item>
        <Sidebar.Item to="/deployment">Deployment</Sidebar.Item>
      </Sidebar.Root>
    )

    screen.getByRole('link', { name: 'Deployment' }).focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('link', { name: 'General' })).toHaveFocus()

    await userEvent.keyboard('{ArrowUp}')
    expect(screen.getByRole('link', { name: 'Deployment' })).toHaveFocus()
  })

  it('should render group with sub items', async () => {
    const { userEvent } = renderWithProviders(
      <Sidebar.Root>
        <Sidebar.Group title="Deployment" icon="gear">
          <Sidebar.SubItem to="/deployment-general">General</Sidebar.SubItem>
          <Sidebar.SubItem to="/deployment-dependencies">Dependencies</Sidebar.SubItem>
        </Sidebar.Group>
      </Sidebar.Root>
    )

    const trigger = screen.getByTestId('sidebar-group-trigger')
    expect(trigger).toBeInTheDocument()

    await userEvent.click(trigger)

    expect(screen.getByTestId('sidebar-group-content')).toBeInTheDocument()
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Dependencies')).toBeInTheDocument()
  })

  it('should auto-open group when child is active', () => {
    mockPathname = '/deployment-general'

    renderWithProviders(
      <Sidebar.Root>
        <Sidebar.Group title="Deployment" icon="gear">
          <Sidebar.SubItem to="/deployment-general">General</Sidebar.SubItem>
          <Sidebar.SubItem to="/deployment-dependencies">Dependencies</Sidebar.SubItem>
        </Sidebar.Group>
      </Sidebar.Root>
    )

    expect(screen.getByTestId('sidebar-group-content')).toBeInTheDocument()
  })

  it('should render item with badge', () => {
    renderWithProviders(
      <Sidebar.Root>
        <Sidebar.Item to="/restrictions" badge="beta">
          Restrictions
        </Sidebar.Item>
      </Sidebar.Root>
    )

    const badge = screen.getByTestId('sidebar-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('beta')
  })

  it('should render sub item with badge', () => {
    renderWithProviders(
      <Sidebar.Root>
        <Sidebar.Group title="Deployment" icon="gear" defaultOpen>
          <Sidebar.SubItem to="/restrictions" badge="beta">
            Restrictions
          </Sidebar.SubItem>
        </Sidebar.Group>
      </Sidebar.Root>
    )

    const badge = screen.getByTestId('sidebar-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('beta')
  })

  it('should toggle group on click', async () => {
    const { userEvent } = renderWithProviders(
      <Sidebar.Root>
        <Sidebar.Group title="Deployment" icon="gear" defaultOpen>
          <Sidebar.SubItem to="/deployment-general">General</Sidebar.SubItem>
        </Sidebar.Group>
      </Sidebar.Root>
    )

    const trigger = screen.getByTestId('sidebar-group-trigger')
    const content = screen.getByTestId('sidebar-group-content')

    expect(content).toBeInTheDocument()

    await userEvent.click(trigger)

    expect(screen.queryByTestId('sidebar-group-content')).not.toBeInTheDocument()
  })
})

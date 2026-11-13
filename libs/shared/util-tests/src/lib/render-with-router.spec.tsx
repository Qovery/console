import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate, useParams } from '@tanstack/react-router'
import { renderWithRouter } from './render-with-router'
import { act, screen } from './shared-util-tests'

jest.unmock('@tanstack/react-router')

function Page() {
  const { projectId } = useParams({ strict: false })
  const { searchStr, state } = useLocation()
  const navigate = useNavigate()
  return (
    <>
      <span>{projectId}</span>
      <span>{searchStr}</span>
      <span>{(state as { code?: string }).code}</span>
      <Link to="/projects/next" search={{ tab: 'settings' }}>
        Next
      </Link>
      <button
        onClick={() =>
          navigate({ to: '/projects/preview', replace: true, state: (previous) => ({ ...previous, code: 'yaml' }) })
        }
      >
        Preview
      </button>
    </>
  )
}

describe('renderWithRouter', () => {
  it('provides route parameters, search and real link navigation', async () => {
    const { userEvent, router } = await renderWithRouter(<Page />, {
      path: '/projects/$projectId',
      route: '/projects/first?tab=overview',
    })
    expect(screen.getByText('first')).toBeInTheDocument()
    expect(screen.getByText('?tab=overview')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/projects/next?tab=settings')
    await userEvent.click(screen.getByRole('link'))
    await act(async () => {
      await router.latestLoadPromise
    })
    expect(await screen.findByText('next')).toBeInTheDocument()
    expect(router.state.location.search).toEqual({ tab: 'settings' })
  })

  it('replaces history, preserves navigation state and supports back navigation', async () => {
    const { userEvent, router } = await renderWithRouter(<Page />, {
      path: '/projects/$projectId',
      route: '/projects/first',
    })
    await userEvent.click(screen.getByRole('link'))
    await act(async () => {
      await router.latestLoadPromise
    })
    await screen.findByText('next')
    await userEvent.click(screen.getByRole('button'))
    await act(async () => {
      await router.latestLoadPromise
    })
    expect(await screen.findByText('yaml')).toBeInTheDocument()
    await act(async () => {
      router.history.back()
      await router.latestLoadPromise
    })
    expect(router.state.location.pathname).toBe('/projects/first')
  })

  it('rerenders without losing router state', async () => {
    const { rerender, router } = await renderWithRouter(<div>First render</div>, { route: '/initial' })
    rerender(<div>Second render</div>)
    expect(screen.getByText('Second render')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/initial')
  })

  it('isolates query caches between renders', async () => {
    function CachedPage() {
      const client = useQueryClient()
      const { data } = useQuery({
        queryKey: ['test'],
        queryFn: () => 'fresh',
        initialData: 'fresh',
        staleTime: Infinity,
      })
      return <button onClick={() => client.setQueryData(['test'], 'changed')}>{data}</button>
    }
    const first = await renderWithRouter(<CachedPage />)
    await first.userEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveTextContent('changed')
    first.unmount()
    await renderWithRouter(<CachedPage />)
    expect(screen.getByRole('button')).toHaveTextContent('fresh')
  })
})

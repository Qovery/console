import { type QueryClient } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { ServiceTerminal, type ServiceTerminalProps } from './service-terminal'

jest.mock('color', () => ({
  __esModule: true,
  default: () => ({
    hex: () => '#000000',
  }),
}))

jest.mock('@qovery/state/util-queries', () => ({
  useReactQueryWsSubscription: jest.fn(),
}))

jest.mock('../..', () => ({
  useRunningStatus: () => ({ data: { pods: [], state: 'STOPPED' }, isLoading: false }),
}))

const props: ServiceTerminalProps = {
  organizationId: '0',
  clusterId: '0',
  projectId: '0',
  environmentId: '0',
  serviceId: '0',
}

const useReactQueryWsSubscriptionMock = jest.mocked(useReactQueryWsSubscription)

const getLatestWsSubscriptionConfig = (): Parameters<typeof useReactQueryWsSubscription>[0] => {
  const latestCall = useReactQueryWsSubscriptionMock.mock.calls.at(-1)

  if (!latestCall) {
    throw new Error('Expected useReactQueryWsSubscription to be called at least once.')
  }

  return latestCall[0]
}

describe('ServiceTerminal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<ServiceTerminal {...props} />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should show a retry empty state and disable subscription on terminal launch error', () => {
    renderWithProviders(<ServiceTerminal {...props} />)

    act(() => {
      getLatestWsSubscriptionConfig().onClose?.(
        {} as QueryClient,
        new CloseEvent('close', { code: 1000, reason: 'No pod exists for this application.' })
      )
    })

    expect(screen.getByText('Unable to launch CLI')).toBeInTheDocument()
    expect(screen.getByText("We could not launch the CLI for this service because it's stopped.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Relaunch' })).toBeInTheDocument()
    expect(useReactQueryWsSubscriptionMock).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: false }))
  })

  it('should restart terminal launch flow when retrying from empty state', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ServiceTerminal {...props} />)

    act(() => {
      getLatestWsSubscriptionConfig().onClose?.(
        {} as QueryClient,
        new CloseEvent('close', { code: 1000, reason: 'No pod exists for this application.' })
      )
    })

    await user.click(screen.getByRole('button', { name: 'Relaunch' }))

    await waitFor(() => {
      expect(screen.queryByText('Unable to launch CLI')).not.toBeInTheDocument()
      expect(useReactQueryWsSubscriptionMock).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: true }))
    })
  })
})

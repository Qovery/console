import { DebugFlavor } from 'qovery-ws-typescript-axios'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { ClusterTerminal, type ClusterTerminalProps } from './cluster-terminal'

jest.mock('color', () => ({
  __esModule: true,
  default: () => ({
    hex: () => '#000000',
  }),
}))

jest.mock('@qovery/state/util-queries', () => ({
  useReactQueryWsSubscription: jest.fn(),
}))

jest.mock('../hooks/use-cluster-running-status/use-cluster-running-status', () => ({
  __esModule: true,
  default: () => ({ data: {} }),
}))

const props: ClusterTerminalProps = {
  organizationId: '0',
  clusterId: '0',
}

const useReactQueryWsSubscriptionMock = jest.mocked(useReactQueryWsSubscription)

describe('ClusterTerminal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<ClusterTerminal {...props} />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should use regular privilege for GCP clusters', () => {
    renderWithProviders(<ClusterTerminal {...props} cloudProvider="GCP" />)

    expect(useReactQueryWsSubscriptionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        urlSearchParams: expect.objectContaining({
          flavor: DebugFlavor.REGULAR_PRIVILEGE,
        }),
      })
    )
  })

  it('should keep full privilege for non-GCP clusters', () => {
    renderWithProviders(<ClusterTerminal {...props} cloudProvider="AWS" />)

    expect(useReactQueryWsSubscriptionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        urlSearchParams: expect.objectContaining({
          flavor: DebugFlavor.FULL_PRIVILEGE,
        }),
      })
    )
  })
})

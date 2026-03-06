import { renderWithProviders } from '@qovery/shared/util-tests'
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

describe('ClusterTerminal', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<ClusterTerminal {...props} />)
    expect(baseElement).toMatchSnapshot()
  })
})

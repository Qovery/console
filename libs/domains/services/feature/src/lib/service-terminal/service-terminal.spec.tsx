import { renderWithProviders } from '@qovery/shared/util-tests'
import { ServiceTerminal, type ServiceTerminalProps } from './service-terminal'

jest.mock('@qovery/state/util-queries', () => ({
  useReactQueryWsSubscription: jest.fn(),
}))

jest.mock('../..', () => ({
  ...jest.requireActual('../..'),
  useRunningStatus: jest.fn(() => ({
    data: undefined,
    isLoading: false,
  })),
}))

const props: ServiceTerminalProps = {
  organizationId: '0',
  clusterId: '0',
  projectId: '0',
  environmentId: '0',
  serviceId: '0',
}
describe('ServiceTerminal', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<ServiceTerminal {...props} />)
    expect(baseElement).toMatchSnapshot()
  })
})

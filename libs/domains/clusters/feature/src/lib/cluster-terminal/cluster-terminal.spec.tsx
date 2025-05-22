import { renderWithProviders } from '@qovery/shared/util-tests'
import { ClusterTerminal, type ClusterTerminalProps } from './cluster-terminal'

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

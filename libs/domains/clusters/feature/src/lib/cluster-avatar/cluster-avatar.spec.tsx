import { renderWithProviders } from '@qovery/shared/util-tests'
import { ClusterAvatar } from './cluster-avatar'

jest.mock('@qovery/shared/ui', () => {
  const React = jest.requireActual('react')
  const ui = jest.requireActual('@qovery/shared/ui')
  return {
    ...ui,
    Icon: (props: { name?: string; iconName?: string }) =>
      React.createElement('span', { 'data-icon-name': props.name ?? props.iconName }),
  }
})

describe('ClusterAvatar', () => {
  it.each([
    ['AWS', 'AWS'],
    ['GCP', 'GCP'],
    ['ON_PREMISE', 'KUBERNETES'],
    ['OVH', 'OVH_CLOUD'],
    ['ORACLE', 'ORACLE_CLOUD'],
    ['IBM', 'IBM_CLOUD'],
  ] as const)('shows the %s provider icon', (cloudProvider, iconName) => {
    const { container } = renderWithProviders(<ClusterAvatar cloudProvider={cloudProvider} />)

    expect(container.querySelector(`[data-icon-name="${iconName}"]`)).toBeInTheDocument()
  })

  it('shows a demo icon for demo clusters', () => {
    const { container } = renderWithProviders(
      <ClusterAvatar cluster={{ id: 'cluster-id', is_demo: true, cloud_provider: 'ON_PREMISE' } as never} />
    )

    expect(container.querySelector('[data-icon-name="laptop-code"]')).toBeInTheDocument()
  })
})

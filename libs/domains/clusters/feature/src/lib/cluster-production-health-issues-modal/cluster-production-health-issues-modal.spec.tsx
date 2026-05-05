import * as Dialog from '@radix-ui/react-dialog'
import type { Cluster } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  type ClusterProductionHealthIssuesGroup,
  ClusterProductionHealthIssuesModal,
} from './cluster-production-health-issues-modal'

const baseCluster = {
  id: 'cluster-id',
  name: 'prod-cluster',
  organization: { id: 'org-id' },
  cloud_provider: 'AWS',
  region: 'us-east-1',
  version: '1.27',
  kubernetes: 'MANAGED',
  deployment_status: 'UP_TO_DATE',
  production: true,
} as unknown as Cluster

const noop = jest.fn()

describe('ClusterProductionHealthIssuesModal', () => {
  it('renders a calmer update report when clusters only have updates available', () => {
    const groups: ClusterProductionHealthIssuesGroup[] = [
      {
        kind: 'update-available',
        entries: [{ cluster: baseCluster, issues: ['update-available'] }],
      },
    ]

    renderWithProviders(
      <Dialog.Root open>
        <Dialog.Content>
          <ClusterProductionHealthIssuesModal groups={groups} count={1} onClose={noop} />
        </Dialog.Content>
      </Dialog.Root>
    )

    expect(screen.getByText('Cluster updates report')).toBeInTheDocument()
    expect(screen.getByText(/updates are available on/i)).toBeInTheDocument()
    expect(screen.getByText(/plan them when you are ready/i)).toBeInTheDocument()
  })

  it('keeps the broader health report copy when runtime issues are present', () => {
    const groups: ClusterProductionHealthIssuesGroup[] = [
      {
        kind: 'deploy-failed',
        entries: [{ cluster: baseCluster, issues: ['deploy-failed'] }],
      },
      {
        kind: 'update-available',
        entries: [{ cluster: baseCluster, issues: ['update-available'] }],
      },
    ]

    renderWithProviders(
      <Dialog.Root open>
        <Dialog.Content>
          <ClusterProductionHealthIssuesModal groups={groups} count={1} onClose={noop} />
        </Dialog.Content>
      </Dialog.Root>
    )

    expect(screen.getByText('Cluster health report')).toBeInTheDocument()
    expect(screen.getByText(/that need your attention/i)).toBeInTheDocument()
  })
})

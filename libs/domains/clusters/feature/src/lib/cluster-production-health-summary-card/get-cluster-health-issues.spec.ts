import type { Cluster, ClusterStatus } from 'qovery-typescript-axios'
import type { ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { getClusterHealthIssues, getClusterHealthIssuesSeverity } from './get-cluster-health-issues'

const baseCluster = {
  id: 'cluster-id',
  organization: { id: 'org-id' },
  deployment_status: 'UP_TO_DATE',
} as Cluster

const baseDeploymentStatus = {
  cluster_id: 'cluster-id',
  status: 'DEPLOYED',
  is_deployed: true,
} as ClusterStatus

describe('getClusterHealthIssues', () => {
  it('returns empty list for a healthy, up-to-date, running cluster', () => {
    const runningStatus = {
      computed_status: { global_status: 'RUNNING' },
    } as unknown as ClusterStatusDto

    expect(
      getClusterHealthIssues({
        cluster: baseCluster,
        deploymentStatus: baseDeploymentStatus,
        runningStatus,
        hasRunningStatusTimedOut: true,
      })
    ).toEqual([])
  })

  it('flags deploy-failed when deployment status indicates a failed state', () => {
    expect(
      getClusterHealthIssues({
        cluster: baseCluster,
        deploymentStatus: { ...baseDeploymentStatus, status: 'DEPLOYMENT_ERROR' },
        runningStatus: { computed_status: { global_status: 'RUNNING' } } as unknown as ClusterStatusDto,
        hasRunningStatusTimedOut: true,
      })
    ).toContain('deploy-failed')
  })

  it('flags running-error when global status is ERROR', () => {
    expect(
      getClusterHealthIssues({
        cluster: baseCluster,
        deploymentStatus: baseDeploymentStatus,
        runningStatus: { computed_status: { global_status: 'ERROR' } } as unknown as ClusterStatusDto,
        hasRunningStatusTimedOut: true,
      })
    ).toContain('running-error')
  })

  it('ignores running status issues when the running-status feature is disabled', () => {
    const issues = getClusterHealthIssues({
      cluster: baseCluster,
      deploymentStatus: baseDeploymentStatus,
      runningStatus: { computed_status: { global_status: 'ERROR' } } as unknown as ClusterStatusDto,
      isRunningStatusIssueEnabled: false,
      hasRunningStatusTimedOut: true,
    })

    expect(issues).not.toContain('running-error')
    expect(issues).not.toContain('status-unavailable')
  })

  it('flags status-unavailable when running status is NotFound', () => {
    expect(
      getClusterHealthIssues({
        cluster: baseCluster,
        deploymentStatus: baseDeploymentStatus,
        runningStatus: 'NotFound',
        hasRunningStatusTimedOut: true,
      })
    ).toContain('status-unavailable')
  })

  it('flags status-unavailable when running status is missing after timeout', () => {
    expect(
      getClusterHealthIssues({
        cluster: baseCluster,
        deploymentStatus: baseDeploymentStatus,
        runningStatus: undefined,
        hasRunningStatusTimedOut: true,
      })
    ).toContain('status-unavailable')
  })

  it('does not flag status-unavailable while still loading', () => {
    expect(
      getClusterHealthIssues({
        cluster: baseCluster,
        deploymentStatus: baseDeploymentStatus,
        runningStatus: undefined,
        hasRunningStatusTimedOut: false,
      })
    ).not.toContain('status-unavailable')
  })

  it('flags update-available when cluster deployment_status is OUT_OF_DATE', () => {
    expect(
      getClusterHealthIssues({
        cluster: { ...baseCluster, deployment_status: 'OUT_OF_DATE' } as Cluster,
        deploymentStatus: baseDeploymentStatus,
        runningStatus: { computed_status: { global_status: 'RUNNING' } } as unknown as ClusterStatusDto,
        hasRunningStatusTimedOut: true,
      })
    ).toContain('update-available')
  })

  it('ignores runtime issues for stopped clusters', () => {
    const issues = getClusterHealthIssues({
      cluster: { ...baseCluster, deployment_status: 'OUT_OF_DATE' } as Cluster,
      deploymentStatus: { ...baseDeploymentStatus, status: 'STOPPED' },
      runningStatus: 'NotFound',
      hasRunningStatusTimedOut: true,
    })
    expect(issues).not.toContain('running-error')
    expect(issues).not.toContain('status-unavailable')
    expect(issues).not.toContain('update-available')
  })

  it('returns null severity for an empty issue list', () => {
    expect(getClusterHealthIssuesSeverity([])).toBeNull()
  })

  it('returns warning severity when only warning-level issues are present', () => {
    expect(getClusterHealthIssuesSeverity(['status-unavailable', 'update-available'])).toBe('warning')
  })

  it('returns error severity when at least one error-level issue is present', () => {
    expect(getClusterHealthIssuesSeverity(['status-unavailable', 'deploy-failed'])).toBe('error')
    expect(getClusterHealthIssuesSeverity(['running-error'])).toBe('error')
  })

  it('combines multiple issues', () => {
    const issues = getClusterHealthIssues({
      cluster: { ...baseCluster, deployment_status: 'OUT_OF_DATE' } as Cluster,
      deploymentStatus: { ...baseDeploymentStatus, status: 'DEPLOYMENT_ERROR' },
      runningStatus: { computed_status: { global_status: 'ERROR' } } as unknown as ClusterStatusDto,
      hasRunningStatusTimedOut: true,
    })
    expect(issues).toEqual(expect.arrayContaining(['deploy-failed', 'running-error', 'update-available']))
  })
})

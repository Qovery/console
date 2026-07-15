import { ClusterOperatorApi } from 'qovery-typescript-axios'
import { clusterOperator, clusterOperatorMutations } from './cluster-operator'

describe('clusterOperator', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('gets the operator bootstrap through the generated client', async () => {
    const bootstrap = {
      chart_repository: 'oci://public.ecr.aws/r3m4q3r9',
      chart_name: 'qovery-operator',
      chart_version: '0.2.1',
      chart_reference: 'oci://public.ecr.aws/r3m4q3r9/qovery-operator',
      namespace: 'qovery',
      release_name: 'qovery-operator',
      values: { clusterId: 'cluster-123' },
      values_yaml: 'clusterId: cluster-123',
      helm_command: 'helm upgrade --install qovery-operator',
    }
    const getBootstrap = jest
      .spyOn(ClusterOperatorApi.prototype, 'getClusterOperatorBootstrap')
      .mockResolvedValue({ data: bootstrap } as never)

    const query = clusterOperator.bootstrap({ organizationId: 'org-123', clusterId: 'cluster-123' })
    await expect(query.queryFn({} as Parameters<typeof query.queryFn>[0])).resolves.toEqual(bootstrap)
    expect(getBootstrap).toHaveBeenCalledWith('org-123', 'cluster-123')
  })

  it('gets the operator status through the generated client', async () => {
    const status = {
      organization_id: 'org-123',
      cluster_id: 'cluster-123',
      operator_connected: true,
      last_heartbeat: '2026-07-15T15:00:00Z',
      operator_version: 'v1.203.0',
      desired_image_version: 'v1.203.0',
      desired_chart_version: '0.2.1',
      reported_chart_version: '0.2.1',
      status: 'CURRENT' as const,
    }
    const getStatus = jest
      .spyOn(ClusterOperatorApi.prototype, 'getClusterOperatorStatus')
      .mockResolvedValue({ data: status } as never)

    const query = clusterOperator.status({ organizationId: 'org-123', clusterId: 'cluster-123' })
    await expect(query.queryFn({} as Parameters<typeof query.queryFn>[0])).resolves.toEqual(status)
    expect(getStatus).toHaveBeenCalledWith('org-123', 'cluster-123')
  })

  it('attaches the operator through the generated client', async () => {
    const attach = jest.spyOn(ClusterOperatorApi.prototype, 'attachClusterOperator').mockResolvedValue({} as never)

    await clusterOperatorMutations.attach({ organizationId: 'org-123', clusterId: 'cluster-123' })

    expect(attach).toHaveBeenCalledWith('org-123', 'cluster-123')
  })
})

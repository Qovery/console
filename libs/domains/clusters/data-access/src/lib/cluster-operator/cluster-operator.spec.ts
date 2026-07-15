import axios from 'axios'
import { clusterOperator } from './cluster-operator'

describe('clusterOperator', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('maps the bootstrap response from the API snake case contract', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({
      data: {
        chart_repository: 'https://helm.qovery.com',
        chart_name: 'qovery-operator',
        chart_version: '1.2.3',
        namespace: 'qovery',
        release_name: 'qovery-operator',
        values: { clusterId: 'cluster-123' },
        values_yaml: 'clusterId: cluster-123',
        helm_command: 'helm upgrade --install qovery-operator',
      },
    })

    const query = clusterOperator.bootstrap({ organizationId: 'org-123', clusterId: 'cluster-123' })
    const result = await query.queryFn({} as Parameters<typeof query.queryFn>[0])

    expect(result).toEqual({
      chartRepository: 'https://helm.qovery.com',
      chartName: 'qovery-operator',
      chartVersion: '1.2.3',
      namespace: 'qovery',
      releaseName: 'qovery-operator',
      values: { clusterId: 'cluster-123' },
      valuesYaml: 'clusterId: cluster-123',
      helmCommand: 'helm upgrade --install qovery-operator',
    })
  })

  it('maps the operator status response from the API snake case contract', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({
      data: {
        organization_id: 'org-123',
        cluster_id: 'cluster-123',
        operator_connected: true,
        last_heartbeat: '2026-07-15T15:00:00Z',
        operator_version: '1.2.3',
        controller_version: '1.2.3',
        request_schema_version: '1',
      },
    })

    const query = clusterOperator.status({ organizationId: 'org-123', clusterId: 'cluster-123' })
    const result = await query.queryFn({} as Parameters<typeof query.queryFn>[0])

    expect(result).toEqual({
      organizationId: 'org-123',
      clusterId: 'cluster-123',
      operatorConnected: true,
      lastHeartbeat: '2026-07-15T15:00:00Z',
      operatorVersion: '1.2.3',
      controllerVersion: '1.2.3',
      requestSchemaVersion: '1',
    })
  })
})

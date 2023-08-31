import { Skeleton, TablePrimitives } from '@qovery/shared/ui'
import { useMetrics } from '../hooks/use-metrics/use-metrics'

const { Table } = TablePrimitives

export interface PodsMetricsProps {
  environmentId: string
  serviceId: string
}

export function PodsMetrics({ environmentId, serviceId }: PodsMetricsProps) {
  const { data = [], isLoading } = useMetrics({ environmentId, serviceId })

  if (data === null) {
    return null
  }

  return (
    <Table.Root className="w-full">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell className="font-medium w-1/2">Instance name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell className="font-medium">RAM usage</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell className="font-medium">vCPU</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell className="font-medium">Storage</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {isLoading ? (
          <Table.Row>
            <Table.Cell>
              <Skeleton height={18} width={200} />
            </Table.Cell>
            <Table.Cell>
              <Skeleton height={18} width={20} />
            </Table.Cell>
            <Table.Cell>
              <Skeleton height={18} width={20} />
            </Table.Cell>
            <Table.Cell>
              <Skeleton height={18} width={20} />
            </Table.Cell>
          </Table.Row>
        ) : data?.length ? (
          data.map((podMetrics) => (
            <Table.Row key={podMetrics.pod_name}>
              <Table.Cell>{podMetrics.pod_name}</Table.Cell>
              <Table.Cell>{podMetrics.memory.current_percent}%</Table.Cell>
              <Table.Cell>{podMetrics.cpu.current_percent}%</Table.Cell>
              <Table.Cell>
                {podMetrics.storages.length
                  ? // https://qovery.slack.com/archives/C02NQ0LC8M9/p1693235796272359
                    Math.max(...podMetrics.storages.map((storage) => storage.current_percent))
                  : '-'}
              </Table.Cell>
            </Table.Row>
          ))
        ) : (
          <Table.Row>
            <Table.Cell>-</Table.Cell>
            <Table.Cell>-</Table.Cell>
            <Table.Cell>-</Table.Cell>
            <Table.Cell>-</Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table.Root>
  )
}

export default PodsMetrics

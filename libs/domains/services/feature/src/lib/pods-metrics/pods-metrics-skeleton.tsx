import { Skeleton, TablePrimitives } from '@qovery/shared/ui'

const { Table } = TablePrimitives

export function PodsMetricsSkeleton() {
  return (
    <Table.Root className="w-full">
      <Table.Header>
        <Table.Row>
          {[...Array(3)].map((_, index) => (
            <Table.ColumnHeaderCell key={index}>
              <Skeleton height={16} width={index === 0 ? 200 : 100} />
            </Table.ColumnHeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {[...Array(5)].map((_, index) => (
          <Table.Row key={index}>
            {[...Array(3)].map((_, index) => (
              <Table.Cell key={index}>
                <Skeleton height={16} width={index === 0 ? 100 : 60} />
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

export default PodsMetricsSkeleton

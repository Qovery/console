import { Skeleton, TablePrimitives } from '@qovery/shared/ui'

const { Table } = TablePrimitives

export function EnvironmentDeploymentListSkeleton() {
  const columnSizes = ['40%', '15%', '13%', '12%', '20%']

  return (
    <Table.Root className="w-full border-b">
      <Table.Header>
        <Table.Row>
          {[...Array(5)].map((_, index) => (
            <Table.ColumnHeaderCell key={index} className="first:border-r" style={{ width: columnSizes[index] }}>
              <Skeleton height={16} width={100} />
            </Table.ColumnHeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {[...Array(20)].map((_, index) => (
          <Table.Row key={index}>
            {[...Array(5)].map((_, index) => (
              <Table.Cell key={index} className="h-14 first:border-r" style={{ width: columnSizes[index] }}>
                {index === 0 ? (
                  <div className="flex items-center justify-between">
                    <Skeleton height={16} width={300} />
                    <Skeleton height={16} width={200} />
                  </div>
                ) : (
                  <Skeleton height={16} width={60} />
                )}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

export default EnvironmentDeploymentListSkeleton

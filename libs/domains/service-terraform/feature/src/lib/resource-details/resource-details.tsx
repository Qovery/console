import { type ReactElement, useState } from 'react';
import { type TerraformResource } from '@qovery/domains/service-terraform/data-access';
import { EmptyState, Icon, TablePrimitives } from '@qovery/shared/ui';
import { twMerge } from '@qovery/shared/util-js';







const { Table } = TablePrimitives

export interface ResourceDetailsProps {
  resource: TerraformResource | null
}

interface TableRowData {
  key: string
  value: string
}

export function ResourceDetails({ resource }: ResourceDetailsProps): ReactElement {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!resource) {
    return <EmptyState title="No resource selected" description="Select a resource from the list to view details." />
  }

  const extractedAtDate = new Date(resource.extractedAt).toLocaleString()

  const tableData: TableRowData[] = [
    { key: 'Name', value: resource.name },
    { key: 'Type', value: resource.resourceType },
    { key: 'Address', value: resource.address },
    { key: 'Provider', value: resource.provider },
    { key: 'Mode', value: resource.mode },
    ...Object.entries(resource.attributes).map(([key, val]) => ({
      key,
      value: typeof val === 'string' ? val : JSON.stringify(val),
    })),
    { key: 'Extracted At', value: extractedAtDate },
  ]

  return (
    <div className="flex flex-col overflow-y-auto">
      <div className="overflow-hidden rounded border border-neutral-250">
        <Table.Root className="w-full text-xs">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell className="border-r border-neutral-250 font-medium" style={{ width: '30%' }}>
                Key
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-medium" style={{ width: '70%' }}>
                Value
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {tableData.map((row, index) => (
              <Table.Row
                key={index}
                className="h-12"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Table.Cell style={{ width: '30%' }} className="border-r border-neutral-250 text-neutral-350">
                  {row.key}
                </Table.Cell>
                <Table.Cell
                  style={{ width: '70%' }}
                  className={twMerge(
                    'flex items-center justify-between gap-2 text-neutral-400',
                    hoveredIndex === index && 'group'
                  )}
                >
                  <span className="truncate break-all text-xs">{row.value}</span>
                  {hoveredIndex === index && (
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(row.value)}
                      className="flex-shrink-0 rounded p-1 transition-colors hover:bg-neutral-200"
                      title="Copy to clipboard"
                    >
                      <Icon iconName="copy" className="text-xs text-neutral-350 hover:text-neutral-400" />
                    </button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  )
}

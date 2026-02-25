import { type ReactElement, useState } from 'react'
import { type TerraformResource } from '@qovery/domains/service-terraform/data-access'
import { CopyToClipboardButtonIcon, Icon, TablePrimitives } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

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
    return (
      <div className="px-3 py-8 text-center">
        <Icon iconName="wave-pulse" className="text-neutral" />
        <p className="mt-1 text-xs font-medium text-neutral">No resource selected</p>
        <p className="mt-1 text-xs text-neutral-subtle">Select a resource from the list to view details.</p>
      </div>
    )
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
      <div className="overflow-hidden">
        <Table.Root
          containerClassName="border-none rounded-none"
          className="rounded-t-none border-x-0 border-b-0 border-t text-ssm"
        >
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell className="w-2/4 border-r border-neutral font-medium">Key</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="w-2/4 font-medium">Value</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {tableData.map((row, index) => (
              <Table.Row
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Table.Cell
                  className={twMerge(
                    'h-10 w-1/2 border-r border-neutral py-3 text-neutral-subtle',
                    index > 0 && 'border-t border-neutral'
                  )}
                >
                  {row.key}
                </Table.Cell>
                <Table.Cell
                  className={twMerge(
                    'h-10 w-1/2 py-3 text-neutral',
                    index > 0 && 'border-t border-neutral',
                    hoveredIndex === index && 'group'
                  )}
                >
                  <span className="whitespace-normal break-all text-ssm">{row.value}</span>
                  {hoveredIndex === index && (
                    <CopyToClipboardButtonIcon
                      content={row.value}
                      tooltipContent="Copy to clipboard"
                      className="ml-1.5"
                    />
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

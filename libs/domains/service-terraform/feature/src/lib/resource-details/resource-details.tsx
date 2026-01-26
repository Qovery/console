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
        <Icon iconName="wave-pulse" className="text-neutral-350" />
        <p className="mt-1 text-xs font-medium text-neutral-350">No resource selected</p>
        <p className="mt-1 text-xs text-neutral-350">Select a resource from the list to view details.</p>
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
        <Table.Root className="text-ssm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell className="w-2/4 border-r border-neutral-200 font-medium">
                Key
              </Table.ColumnHeaderCell>
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
                <Table.Cell className="h-10 w-1/2 border-r border-neutral-200 py-3 text-neutral-350">
                  {row.key}
                </Table.Cell>
                <Table.Cell className={twMerge('h-10 w-1/2 py-3 text-neutral-400', hoveredIndex === index && 'group')}>
                  <span className="whitespace-normal break-all text-ssm">{row.value}</span>
                  {hoveredIndex === index && (
                    <CopyToClipboardButtonIcon
                      content={row.value}
                      tooltipContent="Copy to clipboard"
                      className="ml-1.5 text-xs text-neutral-350 hover:text-brand-500"
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

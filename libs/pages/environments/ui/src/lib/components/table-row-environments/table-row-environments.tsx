import { IconEnum } from '@console/shared/enums'
import { Icon, IconFa, TableRow, Tooltip } from '@console/shared/ui'

export interface TableRowEnvironmentsProps {
  data: any
  dataHead: Array<any>
  link: string
  columnsWidth?: string
}

export function TableRowEnvironments(props: TableRowEnvironmentsProps) {
  const { data, dataHead, columnsWidth, link } = props

  return (
    <TableRow dataHead={dataHead} columnsWidth={columnsWidth} link={link}>
      <>
        <div className="flex items-center px-4">
          <Icon className="mr-3 min-w-[14px]" width="0.875rem" viewBox="0 0 14 14" name={IconEnum.SUCCESS} />
          <Tooltip
            content={
              <p>
                {data.cloud_provider.provider} ({data.cloud_provider.cluster})
              </p>
            }
          >
            <div className="w-4 h-4.5 min-w-[16px] mr-3 flex items-center justify-center text-xs text-text-400 text-center bg-element-light-lighter-400 rounded-sm font-bold cursor-pointer">
              {data.cloud_provider.provider.charAt(0)}
            </div>
          </Tooltip>
          <span className="text-sm text-text-500 font-medium truncate">{data.name}</span>
        </div>
        <div className="text-right px-3">
          <span className="text-text-400 text-sm">1h ago</span>
        </div>
        <div className="flex items-center px-4 border-b-element-light-lighter-400 border-l h-full">
          <IconFa name="icon-solid-infinity" className="text-success-500 mr-1 text-xs" />
          <span className="f text-text-500 text-xs font-medium">Continuous running</span>
        </div>
      </>
    </TableRow>
  )
}

export default TableRowEnvironments

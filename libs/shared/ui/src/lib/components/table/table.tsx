import { IconEnum } from '@console/shared/enums'
import { Icon, IconFa, Tooltip } from '@console/shared/ui'

export interface TableProps {
  data: Array<any>
  dataHead?: Array<any>
  className?: string
  columnsWidth?: string
}

const fakeTableHead = [
  {
    title: 'Services',
    className: 'px-4 py-2',
  },
  {
    title: 'Update',
  },
  {
    title: 'Running Schedule',
    className: 'px-4 py-2 border-b-element-light-lighter-400 border-l',
  },
  {
    title: 'Type',
  },
  {
    title: 'Tags',
  },
]

export function Table(props: TableProps) {
  const {
    data,
    className = 'bg-white rounded-sm',
    dataHead = fakeTableHead,
    columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
  } = props

  console.log(data)

  // const classNameHead = `grid grid-cols-${data.length} px-4 py-2`
  // const classNameHead = `grid grid-cols-5 px-4 py-2`

  return (
    <div className={className}>
      <div
        className="grid items-center border-b-element-light-lighter-400 border-b"
        style={{ gridTemplateColumns: columnsWidth }}
      >
        {dataHead.map(({ title, className = 'px-4 py-2' }, index) => (
          <div key={index} className={className}>
            <span className="text-text-400 text-xs font-medium">{title}</span>
          </div>
        ))}
      </div>
      <div>
        {data.map((currentData, index) => (
          <div
            key={index}
            className="grid items-center h-14 border-b-element-light-lighter-400 border-b last:border-0 hover:bg-element-light-lighter-300"
            style={{ gridTemplateColumns: columnsWidth }}
          >
            <div className="flex items-center px-4">
              <Icon className="mr-3 min-w-[14px]" width="0.875rem" viewBox="0 0 14 14" name={IconEnum.SUCCESS} />
              <Tooltip
                content={
                  <p>
                    {currentData.cloud_provider.provider} ({currentData.cloud_provider.cluster})
                  </p>
                }
              >
                <div className="w-4 h-4.5 min-w-[16px] mr-3 flex items-center justify-center text-xs text-text-400 text-center bg-element-light-lighter-400 rounded-sm font-bold">
                  {currentData.cloud_provider.provider.charAt(0)}
                </div>
              </Tooltip>
              <span className="text-sm text-text-500 font-medium truncate">{currentData.name}</span>
            </div>
            <div className="text-right px-3">
              <span className="text-text-400 text-sm">1h ago</span>
            </div>
            <div className="flex items-center px-4 border-b-element-light-lighter-400 border-l h-full">
              <IconFa name="icon-solid-infinity" className="text-success-500 mr-1 text-xs" />
              <span className="f text-text-500 text-xs font-medium">Continuous running</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Table

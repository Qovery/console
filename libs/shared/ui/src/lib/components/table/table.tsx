export interface TableProps {
  data: Array<any>
  dataHead?: Array<any>
  className?: string
}

const fakeTableHead = [
  {
    title: 'Services',
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
  const { data, className = 'bg-white rounded-sm', dataHead = fakeTableHead } = props

  console.log(data)

  // const classNameHead = `grid grid-cols-${data.length} px-4 py-2`
  // const classNameHead = `grid grid-cols-5 px-4 py-2`

  return (
    <div className={className}>
      <div
        className="grid items-center border-b-element-light-lighter-400 border-b"
        style={{ gridTemplateColumns: `repeat(${dataHead.length},minmax(0,1fr))` }}
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
            className="grid items-center h-14"
            style={{ gridTemplateColumns: `repeat(${data.length},minmax(0,1fr))` }}
          >
            <div>
              <span className="text-sm text-text-500 font-medium">{currentData.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Table

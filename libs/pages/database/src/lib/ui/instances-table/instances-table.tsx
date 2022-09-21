import { DatabaseModeEnum } from 'qovery-typescript-axios'

export interface InstancesTableProps {
  /** @TODO Same reason as page-general */
  instances?: any[]
  mode?: DatabaseModeEnum
}

export function InstancesTable(props: InstancesTableProps) {
  const { instances, mode } = props
  return (
    <table className="w-full border border-element-light-lighter-400">
      <thead>
        <tr className="text-xs text-text-400 font-medium">
          <td className="border border-element-light-lighter-400 px-6 py-4 text-text-600">Instance name</td>
          <td className="border border-element-light-lighter-400 px-6 py-4 text-text-600">RAM usage</td>
          <td className="border border-element-light-lighter-400 px-6 py-4 text-text-600">vCPU</td>
          <td className="border border-element-light-lighter-400 px-6 py-4 text-text-600">Storage</td>
        </tr>
      </thead>
      <tbody>
        {instances?.map((instance) => {
          return (
            <tr className="text-xs text-text-500 font-medium" key={instance.name}>
              <td className="border border-element-light-lighter-400 px-6 py-4">
                {mode && mode === DatabaseModeEnum.CONTAINER ? (instance.name ? instance.name : '-') : 'N / A'}
              </td>
              <td className="border border-element-light-lighter-400 px-6 py-4">
                {mode && mode === DatabaseModeEnum.CONTAINER
                  ? instance.memory?.consumed_in_percent
                    ? `${Math.round((instance.memory?.consumed_in_percent || 0) * 10) / 10}%`
                    : '-'
                  : 'N / A'}
              </td>
              <td className="border border-element-light-lighter-400 px-6 py-4">
                {mode && mode === DatabaseModeEnum.CONTAINER
                  ? instance.cpu?.consumed_in_percent
                    ? `${Math.round((instance.cpu?.consumed_in_percent || 0) * 10) / 10}%`
                    : '-'
                  : 'N / A'}
              </td>
              <td className="border border-element-light-lighter-400 px-6 py-4">
                {mode && mode === DatabaseModeEnum.CONTAINER
                  ? instance.storage?.consumed_in_percent
                    ? `${Math.round((instance.storage?.consumed_in_percent || 0) * 10) / 10}%`
                    : '-'
                  : 'N / A'}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default InstancesTable

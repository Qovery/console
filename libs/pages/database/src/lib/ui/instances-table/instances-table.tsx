import {
  type DatabaseCurrentMetricCpu,
  type DatabaseCurrentMetricMemory,
  type DatabaseCurrentMetricStorage,
  DatabaseModeEnum,
} from 'qovery-typescript-axios'

export interface InstancesTableProps {
  instances?: {
    name: string
    memory?: DatabaseCurrentMetricMemory
    cpu?: DatabaseCurrentMetricCpu
    storage?: DatabaseCurrentMetricStorage
  }[]
  mode?: DatabaseModeEnum
}

export function InstancesTable(props: InstancesTableProps) {
  const { instances, mode } = props
  return (
    <table className="w-full border border-neutral-200">
      <thead>
        <tr className="text-xs text-neutral-350 font-medium">
          <td className="border border-neutral-200 px-6 py-4 text-neutral-400">Instance name</td>
          <td className="border border-neutral-200 px-6 py-4 text-neutral-400">RAM usage</td>
          <td className="border border-neutral-200 px-6 py-4 text-neutral-400">vCPU</td>
          <td className="border border-neutral-200 px-6 py-4 text-neutral-400">Storage</td>
        </tr>
      </thead>
      <tbody>
        {instances?.map((instance) => {
          return (
            <tr className="text-xs text-neutral-400 font-medium" key={instance.name}>
              <td className="border border-neutral-200 px-6 py-4">
                {
                  mode && mode === DatabaseModeEnum.CONTAINER
                    ? instance.name
                      ? instance.name
                      : '-'
                    : 'N / A' /** TODO: implem real metrics **/
                }
              </td>
              <td className="border border-neutral-200 px-6 py-4">
                {mode && mode === DatabaseModeEnum.CONTAINER
                  ? Number.isFinite(instance.memory?.consumed_in_percent)
                    ? `${Math.round((instance.memory?.consumed_in_percent ?? 0) * 10) / 10}%`
                    : '-'
                  : 'N / A'}
              </td>
              <td className="border border-neutral-200 px-6 py-4">
                {mode && mode === DatabaseModeEnum.CONTAINER
                  ? Number.isFinite(instance.cpu?.consumed_in_percent)
                    ? `${Math.round((instance.cpu?.consumed_in_percent ?? 0) * 10) / 10}%`
                    : '-'
                  : 'N / A'}
              </td>
              <td className="border border-neutral-200 px-6 py-4">
                {mode && mode === DatabaseModeEnum.CONTAINER
                  ? Number.isFinite(instance.storage?.consumed_in_percent)
                    ? `${Math.round((instance.storage?.consumed_in_percent ?? 0) * 10) / 10}%`
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

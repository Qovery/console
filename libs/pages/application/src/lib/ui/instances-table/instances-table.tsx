import { Instance } from 'qovery-typescript-axios'

export interface InstancesTableProps {
  instances?: Instance[]
}

export function InstancesTable(props: InstancesTableProps) {
  const { instances } = props
  return (
    <table className="w-full border border-zinc-200">
      <thead>
        <tr className="text-xs text-zinc-350 font-medium">
          <td className="border border-zinc-200 px-6 py-4 text-zinc-400">Instance name</td>
          <td className="border border-zinc-200 px-6 py-4 text-zinc-400">RAM usage</td>
          <td className="border border-zinc-200 px-6 py-4 text-zinc-400">vCPU</td>
          <td className="border border-zinc-200 px-6 py-4 text-zinc-400">Storage</td>
        </tr>
      </thead>
      <tbody>
        {instances?.map((instance) => {
          return (
            <tr className="text-xs text-zinc-400 font-medium" key={instance.name}>
              <td className="border border-zinc-200 px-6 py-4">{instance.name}</td>
              <td className="border border-zinc-200 px-6 py-4">
                {Math.round((instance.memory?.consumed_in_percent || 0) * 10) / 10}%
              </td>
              <td className="border border-zinc-200 px-6 py-4">
                {Math.round((instance.cpu?.consumed_in_percent || 0) * 10) / 10}%
              </td>
              <td className="border border-zinc-200 px-6 py-4">–</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default InstancesTable

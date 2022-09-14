import { IconFa } from '@qovery/shared/ui'

export interface PlanListProps {
  title: string
  description: string
  lists: Array<React.ReactElement>
  infos?: string
}

export function PlanList(props: PlanListProps) {
  const { title, description, lists, infos } = props

  return (
    <div className="mt-60">
      <h3 className="text-text-700 mb-3">{title}</h3>
      <p className="text-sm text-text-500 w-96 mb-5">{description}</p>
      <ul className="mb-10">
        {lists.map((list, index) => (
          <li className="flex text-sm text-text-500 mb-2" key={index}>
            <IconFa name="icon-solid-check" className="text-success-500 mr-4" />
            {list}
          </li>
        ))}
      </ul>
      <p className="text-sm text-text-400">{infos}</p>
    </div>
  )
}

export default PlanList

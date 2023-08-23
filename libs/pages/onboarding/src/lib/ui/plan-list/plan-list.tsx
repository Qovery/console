import { type ReactNode } from 'react'
import { IconFa } from '@qovery/shared/ui'

export interface PlanListProps {
  title: string
  description: string
  lists: ReactNode[]
  infos?: string
}

export function PlanList(props: PlanListProps) {
  const { title, description, lists, infos } = props

  return (
    <div className="mt-60">
      <h3 className="text-neutral-400 mb-3">{title}</h3>
      <p className="text-sm text-neutral-400 w-96 mb-5">{description}</p>
      <ul className="mb-10">
        {lists.map((list, index) => (
          <li className="flex text-sm text-neutral-400 mb-2" key={index}>
            <IconFa name="icon-solid-check" className="text-green-500 mr-4" />
            {list}
          </li>
        ))}
      </ul>
      <p className="text-sm text-neutral-350">{infos}</p>
    </div>
  )
}

export default PlanList

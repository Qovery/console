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
      <h3 className="mb-3 text-neutral-400">{title}</h3>
      <p className="mb-5 w-96 text-sm text-neutral-400">{description}</p>
      <ul className="mb-10">
        {lists.map((list, index) => (
          <li className="mb-2 flex text-sm text-neutral-400" key={index}>
            <IconFa name="icon-solid-check" className="mr-4 text-green-500" />
            {list}
          </li>
        ))}
      </ul>
      <p className="text-sm text-neutral-350">{infos}</p>
    </div>
  )
}

export default PlanList

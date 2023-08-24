import { type ServiceTypeEnum } from '@qovery/shared/enums'

export interface AboutProps {
  description: string
  type?: ServiceTypeEnum
}

export function About(props: AboutProps) {
  const { description } = props

  return (
    <div className="pt-2 pb-8 px-8 flex flex-col items-start border-b border-neutral-200">
      <div className="font-bold mb-3 text-neutral-400">About</div>
      <p className="text-neutral-400 mb-5">{description ? description : 'No description provided yet'}</p>
    </div>
  )
}

export default About

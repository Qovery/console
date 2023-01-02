import { ApplicationEntity } from '@qovery/shared/interfaces'
import { timeAgo } from '@qovery/shared/utils'

export interface AboutContentContainerProps {
  application: ApplicationEntity
}

export function AboutContentContainer(props: AboutContentContainerProps) {
  const { application } = props

  return (
    <div className="py-6 px-10">
      <div className="text-subtitle mb-3 text-text-600">Image information</div>
      <div className="mb-3">
        <p className="text-text-500 mb-2">
          Image name: {application.image_name} {application.source?.image?.image_name}
        </p>
        <p className="text-text-500 mb-2">
          Latest deployed tag: {application.tag} {application.source?.image?.tag}
        </p>
        <p className="text-text-400 text-sm">{timeAgo(new Date(application?.updated_at || ''))}</p>
      </div>
    </div>
  )
}

export default AboutContentContainer

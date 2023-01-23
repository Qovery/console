import { ApplicationEntity } from '@qovery/shared/interfaces'
import { dateFullFormat, timeAgo } from '@qovery/shared/utils'

export interface AboutUpdateProps {
  application?: ApplicationEntity
}

export function AboutUpdate(props: AboutUpdateProps) {
  return (
    <div className="p-8 text-text-400 text-sm">
      {props.application?.created_at && (
        <div className="mb-2">Created: {dateFullFormat(props.application.created_at)}</div>
      )}
      {props.application?.updated_at && <div>Last edit: {timeAgo(new Date(props.application.updated_at))}</div>}
    </div>
  )
}

export default AboutUpdate

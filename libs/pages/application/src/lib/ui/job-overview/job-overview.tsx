import { JobApplicationEntity } from '@qovery/shared/interfaces'
import { PropertyCard } from '@qovery/shared/ui'

export interface JobOverviewProps {
  application: JobApplicationEntity
}

export function JobOverview(props: JobOverviewProps) {
  const { application } = props
  return (
    <div>
      <PropertyCard name="Max restarts" value={application.max_nb_restart?.toString() || ''} />
    </div>
  )
}

export default JobOverview

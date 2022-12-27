import { JobApplicationEntity } from '@qovery/shared/interfaces'
import { PropertyCard } from '@qovery/shared/ui'

export interface JobOverviewProps {
  application: JobApplicationEntity
}

export function JobOverview(props: JobOverviewProps) {
  const { application } = props
  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        <PropertyCard name="Max restarts" value={application.max_nb_restart?.toString() || ''} isLoading={false} />
        <PropertyCard name="Max restarts" value={application.max_nb_restart?.toString() || ''} isLoading={false} />
        <PropertyCard name="Max restarts" value={application.max_nb_restart?.toString() || ''} isLoading={false} />
      </div>
    </div>
  )
}

export default JobOverview

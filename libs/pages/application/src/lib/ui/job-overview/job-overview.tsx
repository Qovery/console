import cronstrue from 'cronstrue'
import { useNavigate, useParams } from 'react-router-dom'
import { isCronJob, isLifeCycleJob } from '@qovery/shared/enums'
import { JobApplicationEntity } from '@qovery/shared/interfaces'
import {
  APPLICATION_SETTINGS_CONFIGURE_URL,
  APPLICATION_SETTINGS_RESOURCES_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_URL,
} from '@qovery/shared/router'
import { PropertyCard } from '@qovery/shared/ui'

export interface JobOverviewProps {
  application: JobApplicationEntity
}

export function JobOverview(props: JobOverviewProps) {
  const { application } = props
  const { organizationId = '', environmentId = '', applicationId = '', projectId = '' } = useParams()
  const navigate = useNavigate()
  const path = APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_SETTINGS_URL

  const eventsToString = (): string => {
    if (!application) return ''
    const events: string[] = []
    if (application) {
      if (application.schedule?.on_start) events.push('Start')
      if (application.schedule?.on_stop) events.push('Stop')
      if (application.schedule?.on_delete) events.push('Delete')
    }

    return events.length === 0 ? 'No events' : events.join(' - ')
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {isCronJob(application) && (
          <PropertyCard
            name="Scheduling"
            value={cronstrue.toString(application.schedule?.cronjob?.scheduled_at?.toString() || '')}
            isLoading={false}
            onSettingsClick={() => navigate(`${path}${APPLICATION_SETTINGS_CONFIGURE_URL}`)}
          />
        )}
        {isLifeCycleJob(application) && (
          <PropertyCard
            name="Environment Event"
            value={`${eventsToString()}`}
            isLoading={false}
            onSettingsClick={() => navigate(`${path}${APPLICATION_SETTINGS_CONFIGURE_URL}`)}
          />
        )}
        <PropertyCard
          name="Max Restarts"
          value={application.max_nb_restart?.toString() || ''}
          isLoading={false}
          onSettingsClick={() => navigate(`${path}${APPLICATION_SETTINGS_CONFIGURE_URL}`)}
        />
        <PropertyCard
          name="Max Duration"
          value={application.max_duration_seconds?.toString() || ''}
          isLoading={false}
          onSettingsClick={() => navigate(`${path}${APPLICATION_SETTINGS_CONFIGURE_URL}`)}
        />
        <PropertyCard
          name="VCPU"
          value={application.max_nb_restart?.toString() || ''}
          isLoading={false}
          onSettingsClick={() => navigate(`${path}${APPLICATION_SETTINGS_RESOURCES_URL}`)}
        />
        <PropertyCard
          name="RAM"
          value={application.memory.toString() + ' mb'}
          isLoading={false}
          onSettingsClick={() => navigate(`${path}${APPLICATION_SETTINGS_RESOURCES_URL}`)}
        />
        <PropertyCard
          name="Port"
          value={application.port?.toString() || '–'}
          isLoading={false}
          onSettingsClick={() => navigate(`${path}${APPLICATION_SETTINGS_CONFIGURE_URL}`)}
        />
      </div>
    </div>
  )
}

export default JobOverview

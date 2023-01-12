import cronstrue from 'cronstrue'
import { useNavigate, useParams } from 'react-router-dom'
import { isCronJob, isLifeCycleJob } from '@qovery/shared/enums'
import { JobApplicationEntity } from '@qovery/shared/interfaces'
import {
  APPLICATION_SETTINGS_CONFIGURE_URL,
  APPLICATION_SETTINGS_RESOURCES_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_URL,
} from '@qovery/shared/routes'
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
    if (application.schedule?.on_start) events.push('Start')
    if (application.schedule?.on_stop) events.push('Stop')
    if (application.schedule?.on_delete) events.push('Delete')

    return events.length === 0 ? 'No events' : events.join(' - ')
  }

  return (
    <div>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
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
            value={eventsToString()}
            isLoading={false}
            onSettingsClick={() => navigate(`${path}${APPLICATION_SETTINGS_CONFIGURE_URL}`)}
            helperText="Execute this job at some given event"
          />
        )}
        <PropertyCard
          name="Max Restarts"
          value={application.max_nb_restart?.toString() || ''}
          isLoading={false}
          onSettingsClick={() => navigate(`${path}${APPLICATION_SETTINGS_CONFIGURE_URL}`)}
          helperText="Maximum number of restarts allowed in case of job failure (0 means no failure)"
        />
        <PropertyCard
          name="Max Duration"
          value={application.max_duration_seconds?.toString() || ''}
          isLoading={false}
          onSettingsClick={() => navigate(`${path}${APPLICATION_SETTINGS_CONFIGURE_URL}`)}
          helperText="Maximum duration allowed for the job to run before killing it and mark it as failed"
        />
        <PropertyCard
          name="VCPU"
          value={application.max_nb_restart?.toString() || ''}
          isLoading={false}
          onSettingsClick={() => navigate(`${path}${APPLICATION_SETTINGS_RESOURCES_URL}`)}
        />
        <PropertyCard
          name="RAM"
          value={application.memory.toString() + ' MB'}
          isLoading={false}
          onSettingsClick={() => navigate(`${path}${APPLICATION_SETTINGS_RESOURCES_URL}`)}
        />
        <PropertyCard
          name="Port"
          value={application.port?.toString() || '–'}
          isLoading={false}
          onSettingsClick={() => navigate(`${path}${APPLICATION_SETTINGS_CONFIGURE_URL}`)}
          helperText="Port where to run readiness and liveliness probes checks. The port will not be exposed externally"
        />
      </div>
    </div>
  )
}

export default JobOverview

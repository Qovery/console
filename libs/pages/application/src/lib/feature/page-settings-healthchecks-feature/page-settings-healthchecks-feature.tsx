import equal from 'fast-deep-equal'
import { Probe, ProbeType } from 'qovery-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editApplication, getApplicationsState, postApplicationActionsRedeploy } from '@qovery/domains/application'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { defaultLivenessProbe, defaultReadinessProbe, probeFormatted } from '@qovery/shared/console-shared'
import { ProbeTypeEnum, getServiceType, isJob } from '@qovery/shared/enums'
import { ApplicationEntity, HealthcheckData } from '@qovery/shared/interfaces'
import { APPLICATION_SETTINGS_RESOURCES_URL, APPLICATION_SETTINGS_URL, APPLICATION_URL } from '@qovery/shared/routes'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsHealthchecks from '../../ui/page-settings-healthchecks/page-settings-healthchecks'

export const handleSubmit = (data: FieldValues, application: ApplicationEntity): ApplicationEntity => {
  const defaultPort = application?.ports?.[0]?.internal_port || application.port

  const result = {
    ...application,
    healthchecks: {
      readiness_probe:
        ProbeTypeEnum.NONE !== data['readiness_probe']['current_type']
          ? probeFormatted(data['readiness_probe'], defaultPort)
          : undefined,
      liveness_probe:
        ProbeTypeEnum.NONE !== data['liveness_probe']['current_type']
          ? probeFormatted(data['liveness_probe'], defaultPort)
          : undefined,
    },
  }

  return result
}

export function PageSettingsHealthchecksFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()

  const dispatch = useDispatch<AppDispatch>()
  const { data: environment } = useFetchEnvironment(projectId, environmentId)

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId],
    equal
  )

  const toasterCallback = () => {
    if (application) {
      dispatch(
        postApplicationActionsRedeploy({ applicationId, environmentId, serviceType: getServiceType(application) })
      )
    }
  }

  const [loading, setLoading] = useState<boolean>(false)

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      readiness_probe: {
        ...{
          type: {
            [ProbeTypeEnum.NONE.toLowerCase()]: null,
          },
        },
        ...defaultReadinessProbe,
      },
      liveness_probe: {
        ...{
          type: {
            [ProbeTypeEnum.NONE.toLowerCase()]: null,
          },
        },
        ...defaultLivenessProbe,
      },
    } as HealthcheckData,
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (application) {
      setLoading(true)
      const cloneApplication = handleSubmit(data, application)

      dispatch(
        editApplication({
          applicationId: applicationId,
          data: cloneApplication,
          serviceType: getServiceType(application),
          toasterCallback,
        })
      )
        .unwrap()
        .catch((error) => console.error(error))
        .finally(() => setLoading(false))
    }
  })

  // Use memo to get the TYPE of readiness probe
  const defaultTypeReadiness = useMemo(() => {
    const types = application?.healthchecks?.readiness_probe?.type as ProbeType
    const readinessProbeKeys = Object.keys(types || {})
    const nonNullKeyReadiness = readinessProbeKeys.find((key) => (types as { [key: string]: {} })[key] !== null)
    return nonNullKeyReadiness?.toUpperCase() || ProbeTypeEnum.NONE
  }, [application?.healthchecks?.readiness_probe])

  // Use memo to get the TYPE of liveness probe
  const defaultTypeLiveness = useMemo(() => {
    const types = application?.healthchecks?.liveness_probe?.type as ProbeType
    const livenessProbeKeys = Object.keys(types || {})
    const nonNullKeyLiveness = livenessProbeKeys.find((key) => (types as { [key: string]: {} })[key] !== null)
    return nonNullKeyLiveness?.toUpperCase() || ProbeTypeEnum.NONE
  }, [application?.healthchecks?.liveness_probe])

  useEffect(() => {
    const setProbeValues = (probeName: string, values: Probe) => {
      Object.entries(values).forEach(([field, value]) => {
        const probePath = `${probeName}.${field}`
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          setProbeValues(probePath, value)
        } else {
          // @todo need to find a better way to set the value and remove the any
          methods.setValue(probePath as any, Array.isArray(value) ? JSON.stringify(value) : value)
        }
      })
    }

    methods.setValue('readiness_probe.current_type', defaultTypeReadiness)
    methods.setValue('liveness_probe.current_type', defaultTypeLiveness)

    if (application?.healthchecks?.readiness_probe) {
      setProbeValues('readiness_probe', application?.healthchecks?.readiness_probe)
    }

    if (application?.healthchecks?.liveness_probe) {
      setProbeValues('liveness_probe', application?.healthchecks?.liveness_probe)
    }
  }, [methods, application, defaultTypeReadiness, defaultTypeLiveness])

  return (
    <FormProvider {...methods}>
      <PageSettingsHealthchecks
        ports={application?.ports}
        jobPort={application?.port}
        isJob={isJob(application)}
        minRunningInstances={application?.min_running_instances}
        linkResourcesSetting={`${APPLICATION_URL(
          organizationId,
          projectId,
          environmentId,
          applicationId
        )}${APPLICATION_SETTINGS_URL}${APPLICATION_SETTINGS_RESOURCES_URL}`}
        onSubmit={onSubmit}
        loading={loading}
        environmentMode={environment?.mode}
      />
    </FormProvider>
  )
}

export default PageSettingsHealthchecksFeature

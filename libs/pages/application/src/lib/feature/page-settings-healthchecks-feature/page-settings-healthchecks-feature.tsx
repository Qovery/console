import equal from 'fast-deep-equal'
import { Probe, ProbeType } from 'qovery-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editApplication, getApplicationsState, postApplicationActionsRedeploy } from '@qovery/domains/application'
import {
  ProbeTypeEnum,
  ProbeTypeWithNoneEnum,
  defaultLivenessProbe,
  defaultReadinessProbe,
  probeFormatted,
} from '@qovery/shared/console-shared'
import { getServiceType, isJob } from '@qovery/shared/enums'
import { ApplicationEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { APPLICATION_SETTINGS_PORT_URL, APPLICATION_SETTINGS_URL, APPLICATION_URL } from '@qovery/shared/routes'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsHealthchecks from '../../ui/page-settings-healthchecks/page-settings-healthchecks'

export const handleSubmit = (data: FieldValues, application: ApplicationEntity): ApplicationEntity => {
  const defaultPort = application?.ports?.[0]?.internal_port || application.port

  const result = {
    ...application,
    healthchecks: {
      readiness_probe: probeFormatted(data['readiness_probe'], defaultPort),
      liveness_probe:
        ProbeTypeWithNoneEnum.NONE !== data['liveness_probe']['currentType']
          ? probeFormatted(data['liveness_probe'], defaultPort)
          : undefined,
    },
  }

  return result
}

export function PageSettingsHealthchecksFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()

  const dispatch = useDispatch<AppDispatch>()
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

  const [loading, setLoading] = useState<LoadingStatus>('not loaded')

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      readiness_probe: {
        ...{
          type: {
            [ProbeTypeEnum.TCP.toLowerCase()]: {
              port:
                application?.ports && application?.ports.length > 0
                  ? application?.ports[0].internal_port
                  : application?.port,
            },
          },
        },
        ...defaultReadinessProbe,
      },
      liveness_probe: {
        ...{
          type: {
            [ProbeTypeWithNoneEnum.NONE.toLowerCase()]: null,
          },
        },
        ...defaultLivenessProbe,
      },
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (application) {
      setLoading('loading')
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
        .finally(() => setLoading('loaded'))
    }
  })

  const defaultTypeReadiness = useMemo(() => {
    const readinessProbeKeys = Object.keys((application?.healthchecks?.readiness_probe?.type as ProbeType) || {})
    const nonNullKeyReadiness = readinessProbeKeys.find(
      (key) => (application?.healthchecks?.readiness_probe?.type as any)[key] !== null
    )
    return (nonNullKeyReadiness?.toUpperCase() as ProbeTypeEnum) || ProbeTypeEnum.TCP
  }, [application?.healthchecks?.readiness_probe])

  // Use memo to get the TYPE of liveness probe
  const defaultTypeLiveness = useMemo(() => {
    const livenessProbeKeys = Object.keys((application?.healthchecks?.liveness_probe?.type as ProbeType) || {})
    const nonNullKeyLiveness = livenessProbeKeys.find(
      (key) => (application?.healthchecks?.liveness_probe?.type as any)[key] !== null
    )
    return (nonNullKeyLiveness?.toUpperCase() as ProbeTypeWithNoneEnum) || ProbeTypeWithNoneEnum.NONE
  }, [application?.healthchecks?.liveness_probe])

  useEffect(() => {
    const setProbeValues = (probeName: string, values: Probe) => {
      Object.entries(values).forEach(([field, value]) => {
        const probePath = `${probeName}.${field}`
        if (typeof value === 'object' && value !== null) {
          setProbeValues(probePath, value)
        } else {
          methods.setValue(probePath as any, value)
        }
      })
    }

    methods.setValue('readiness_probe.currentType' as any, defaultTypeReadiness)
    methods.setValue('liveness_probe.currentType' as any, defaultTypeLiveness)

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
        linkPortSetting={`${APPLICATION_URL(
          organizationId,
          projectId,
          environmentId,
          applicationId
        )}${APPLICATION_SETTINGS_URL}${APPLICATION_SETTINGS_PORT_URL}`}
        defaultTypeReadiness={defaultTypeReadiness as ProbeTypeEnum}
        defaultTypeLiveness={defaultTypeLiveness as ProbeTypeWithNoneEnum}
        onSubmit={onSubmit}
        loading={loading}
      />
    </FormProvider>
  )
}

export default PageSettingsHealthchecksFeature

import equal from 'fast-deep-equal'
import { Probe } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editApplication, getApplicationsState, postApplicationActionsRedeploy } from '@qovery/domains/application'
import {
  ProbeTypeEnum,
  ProbeTypeWithNoneEnum,
  defaultLivenessProbe,
  defaultReadinessProbe,
} from '@qovery/shared/console-shared'
import { getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsHealthchecks from '../../ui/page-settings-healthchecks/page-settings-healthchecks'

export const handleSubmit = (data: FieldValues, application: ApplicationEntity): ApplicationEntity => {
  function probeFormatted(currentData: FieldValues): Probe | undefined {
    if (!currentData['currentType']) {
      return undefined
    }

    const type = currentData['currentType'].toLowerCase()
    console.log('currentData: ', currentData)
    console.log('type: ', type)

    let dataType = null

    if (ProbeTypeEnum.HTTP === type.toUpperCase()) {
      dataType = {
        [type]: {
          port: parseInt(currentData['type'][type]['port'], 10),
          path: currentData['type'][type]['path'] || null,
          scheme: currentData['type'][type]['scheme'] || null,
        },
      }
    } else if (ProbeTypeEnum.TCP === type.toUpperCase()) {
      dataType = {
        [type]: {
          port: parseInt(currentData['type'][type]['port'], 10),
        },
      }
    } else if (ProbeTypeEnum.GRPC === type.toUpperCase()) {
      dataType = {
        [type]: {
          port: parseInt(currentData['type'][type]['port'], 10),
          service: currentData['type'][type]['service'] || null,
        },
      }
    } else {
      dataType = {
        [type]: {
          command: currentData['type'][type]['command'].split(','),
        },
      }
    }

    return {
      type: dataType,
      initial_delay_seconds: parseInt(currentData['initial_delay_seconds'], 10),
      period_seconds: parseInt(currentData['period_seconds'], 10),
      timeout_seconds: parseInt(currentData['timeout_seconds'], 10),
      success_threshold: parseInt(currentData['success_threshold'], 10),
      failure_threshold: parseInt(currentData['failure_threshold'], 10),
    } as Probe
  }

  const result = {
    ...application,
    healthchecks: {
      readiness_probe: probeFormatted(data['readiness_probe']),
      liveness_probe:
        ProbeTypeWithNoneEnum.NONE !== data['liveness_probe']['currentType']
          ? probeFormatted(data['liveness_probe'])
          : undefined,
    },
  }

  console.log(result.healthchecks)

  return result
}

export function PageSettingsHealthchecksFeature() {
  const { environmentId = '', applicationId = '' } = useParams()

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
              port: application?.ports && application?.ports.length > 0 ? application?.ports[0].internal_port : 0,
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

    if (application?.healthchecks?.readiness_probe) {
      const defaultType = Object.keys(application?.healthchecks?.readiness_probe?.type as string)[0]
      methods.setValue('readiness_probe.currentType' as any, defaultType?.toUpperCase())

      setProbeValues('readiness_probe', application?.healthchecks?.readiness_probe)
    }

    if (application?.healthchecks?.liveness_probe) {
      const defaultType = Object.keys(application?.healthchecks?.liveness_probe?.type as string)[0]
      methods.setValue('liveness_probe.currentType' as any, defaultType?.toUpperCase() || ProbeTypeWithNoneEnum.NONE)

      setProbeValues('liveness_probe', application?.healthchecks?.liveness_probe)
    }
  }, [methods, application])

  return (
    <FormProvider {...methods}>
      <PageSettingsHealthchecks ports={application?.ports} onSubmit={onSubmit} loading={loading} />
    </FormProvider>
  )
}

export default PageSettingsHealthchecksFeature

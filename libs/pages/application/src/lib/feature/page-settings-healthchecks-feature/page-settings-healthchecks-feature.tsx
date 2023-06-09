import equal from 'fast-deep-equal'
import { Probe } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { getApplicationsState } from '@qovery/domains/application'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { RootState } from '@qovery/store'
import PageSettingsHealthchecks from '../../ui/page-settings-healthchecks/page-settings-healthchecks'

export function PageSettingsHealthchecksFeature() {
  const { applicationId = '' } = useParams()

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId],
    equal
  )

  const methods = useForm({ mode: 'onChange' })

  const onSubmit = methods.handleSubmit((data) => {
    console.log(onSubmit)
  })

  useEffect(() => {
    const setProbeValues = (probeName: string, values: Probe) => {
      Object.entries(values).forEach(([field, value]) => {
        if (typeof value === 'object' && value !== null) {
          setProbeValues(`${probeName}.${field}`, value)
        } else {
          methods.setValue(`${probeName}.${field}`, value)
        }
      })
    }

    if (application?.healthchecks) {
      if (application?.healthchecks?.liveness_probe)
        setProbeValues('liveness_probe', application?.healthchecks?.liveness_probe)
      if (application?.healthchecks?.readiness_probe)
        setProbeValues('readiness_probe', application?.healthchecks?.readiness_probe)
    }
  }, [methods, application])

  return (
    <FormProvider {...methods}>
      <PageSettingsHealthchecks ports={application?.ports} onSubmit={onSubmit} loading={'loaded'} />
    </FormProvider>
  )
}

export default PageSettingsHealthchecksFeature

import { Application } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editApplication, getApplicationsState } from '@console/domains/application'
import { ApplicationEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export function PageSettingsGeneralFeature() {
  const { applicationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId]
  )

  const methods = useForm({
    mode: 'onChange',
  })

  // const watchEnvPreview = methods.watch('buildpacks')

  const onSubmit = methods.handleSubmit((data) => {
    if (data) {
      const cloneApplication = Object.assign({}, application as Application)
      cloneApplication.name = data['name']

      dispatch(
        editApplication({
          applicationId: applicationId,
          data: cloneApplication,
        })
      )
    }
  })

  useEffect(() => {
    methods.setValue('name', application?.name)
  }, [methods, application?.name])

  return (
    <FormProvider {...methods}>
      <PageSettingsGeneral onSubmit={onSubmit} />
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature

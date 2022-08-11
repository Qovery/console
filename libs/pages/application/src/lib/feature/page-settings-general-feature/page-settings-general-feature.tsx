import { BuildModeEnum, BuildPackLanguageEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editApplication, getApplicationsState } from '@console/domains/application'
import { ApplicationEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export const handleSubmit = (data: FieldValues, application: ApplicationEntity) => {
  const cloneApplication = Object.assign({}, application as ApplicationEntity)
  cloneApplication.name = data['name']
  cloneApplication.build_mode = data['build_mode']

  if (data['build_mode'] === BuildModeEnum.DOCKER) {
    cloneApplication.dockerfile_path = data['dockerfile_path']
    cloneApplication.buildpack_language = null
  } else {
    cloneApplication.buildpack_language = data['buildpack_language']
    cloneApplication.dockerfile_path = null
  }

  return cloneApplication
}

export function PageSettingsGeneralFeature() {
  const { applicationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId]
  )
  const loadingStatus = useSelector((state: RootState) => getApplicationsState(state).loadingStatus)

  const methods = useForm({
    mode: 'onChange',
  })

  const watchBuildMode = methods.watch('build_mode')

  const onSubmit = methods.handleSubmit((data) => {
    if (data && application) {
      const cloneApplication = handleSubmit(data, application)

      dispatch(
        editApplication({
          applicationId: applicationId,
          data: cloneApplication,
        })
      )
    }
  })

  useEffect(() => {
    if (watchBuildMode === BuildModeEnum.DOCKER) {
      methods.setValue('dockerfile_path', 'Dockerfile')
    } else {
      methods.setValue('buildpack_language', BuildPackLanguageEnum.PYTHON)
    }
  }, [watchBuildMode, methods])

  useEffect(() => {
    methods.setValue('name', application?.name)
    methods.setValue('provider', application?.git_repository?.provider)
    methods.setValue('repository', application?.git_repository?.url)
    methods.setValue('branch', application?.git_repository?.branch)
    methods.setValue('root_path', application?.git_repository?.root_path)
    methods.setValue('build_mode', application?.build_mode)
    methods.setValue(
      'buildpack_language',
      application?.buildpack_language ? application?.buildpack_language : BuildPackLanguageEnum.PYTHON
    )
    methods.setValue('dockerfile_path', application?.dockerfile_path ? application?.dockerfile_path : 'Dockerfile')
  }, [
    methods,
    application?.name,
    application?.build_mode,
    application?.buildpack_language,
    application?.dockerfile_path,
    application?.git_repository,
  ])

  return (
    <FormProvider {...methods}>
      <PageSettingsGeneral onSubmit={onSubmit} watchBuildMode={watchBuildMode} loading={loadingStatus === 'loading'} />
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature

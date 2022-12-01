import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editProject, selectProjectById } from '@qovery/domains/projects'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import PageProjectGeneral from '../../ui/page-project-general/page-project-general'

export function PageProjectGeneralFeature() {
  const { organizationId = '', projectId = '' } = useParams()
  useDocumentTitle('General - Project settings')

  const project = useSelector((state: RootState) => selectProjectById(state, organizationId, projectId))

  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch<AppDispatch>()

  const methods = useForm({
    mode: 'onChange',
  })

  useEffect(() => {
    methods.reset({
      name: project?.name || '',
      description: project?.description || '',
    })
  }, [methods, project?.name, project?.description])

  const onSubmit = methods.handleSubmit((data) => {
    if (data && project) {
      setLoading(true)

      dispatch(
        editProject({
          projectId,
          data: {
            name: data['name'],
            description: data['description'],
          },
        })
      )
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false))
    }
  })

  return (
    <FormProvider {...methods}>
      <PageProjectGeneral onSubmit={onSubmit} loading={loading} />
    </FormProvider>
  )
}

export default PageProjectGeneralFeature

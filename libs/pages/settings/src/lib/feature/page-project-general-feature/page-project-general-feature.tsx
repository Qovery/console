import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useProject } from '@qovery/domains/projects/feature'
import { editProject } from '@qovery/project'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type AppDispatch } from '@qovery/state/store'
import PageProjectGeneral from '../../ui/page-project-general/page-project-general'

export function PageProjectGeneralFeature() {
  const { projectId = '' } = useParams()
  useDocumentTitle('General - Project settings')

  const { data: project } = useProject({ projectId })

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

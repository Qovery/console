import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useEditProject, useProject } from '@qovery/domains/projects/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageProjectGeneral from '../../ui/page-project-general/page-project-general'

export function PageProjectGeneralFeature() {
  const { organizationId = '', projectId = '' } = useParams()
  useDocumentTitle('General - Project settings')

  const { data: project } = useProject({ organizationId, projectId })
  const { mutateAsync: editProject } = useEditProject()

  const [loading, setLoading] = useState(false)

  const methods = useForm({
    mode: 'onChange',
  })

  useEffect(() => {
    methods.reset({
      name: project?.name || '',
      description: project?.description || '',
    })
  }, [methods, project?.name, project?.description])

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data && project) {
      setLoading(true)

      try {
        await editProject({
          projectId,
          projectRequest: {
            name: data['name'],
            description: data['description'],
          },
        })
      } catch (error) {
        console.error(error)
      }
      setLoading(false)
    }
  })

  return (
    <FormProvider {...methods}>
      <PageProjectGeneral onSubmit={onSubmit} loading={loading} />
    </FormProvider>
  )
}

export default PageProjectGeneralFeature

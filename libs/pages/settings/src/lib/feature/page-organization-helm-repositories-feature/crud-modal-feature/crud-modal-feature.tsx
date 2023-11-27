import { type HelmRepositoryRequest, type HelmRepositoryResponse } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import {
  useAvailableHelmRepositories,
  useCreateHelmRepository,
  useEditHelmRepository,
} from '@qovery/domains/organizations/feature'
import { CrudModal } from '../../../ui/page-organization-helm-repositories/crud-modal/crud-modal'

export interface CrudModalFeatureProps {
  onClose: () => void
  organizationId?: string
  repository?: HelmRepositoryResponse
}

export function CrudModalFeature(props: CrudModalFeatureProps) {
  const { organizationId = '', onClose, repository } = props

  const { data: availableHelmRepositories = [] } = useAvailableHelmRepositories()
  const { mutateAsync: editHelmRepository } = useEditHelmRepository()
  const { mutateAsync: createHelmRepository } = useCreateHelmRepository()
  const [loading, setLoading] = useState(false)

  const methods = useForm({
    defaultValues: {
      name: repository?.name,
      description: repository?.description,
      url: repository?.url,
      kind: repository?.kind,
      config: {},
    },
    mode: 'onChange',
  })

  useEffect(() => {
    setTimeout(() => methods.clearErrors('config'), 0)
  }, [methods])

  const onSubmit = methods.handleSubmit(async (data) => {
    setLoading(true)

    try {
      if (repository) {
        await editHelmRepository({
          organizationId: organizationId,
          helmRepositoryId: repository.id,
          helmRepositoryRequest: data as HelmRepositoryRequest,
        })
        onClose()
      } else {
        await createHelmRepository({
          organizationId: organizationId,
          helmRepositoryRequest: data as HelmRepositoryRequest,
        })
        onClose()
      }
    } catch (error) {
      console.error(error)
    }

    setLoading(false)
  })

  return (
    <FormProvider {...methods}>
      <CrudModal
        repository={repository}
        availableHelmRepositories={availableHelmRepositories}
        onSubmit={onSubmit}
        onClose={onClose}
        loading={loading}
        isEdit={!!repository}
      />
    </FormProvider>
  )
}

export default CrudModalFeature

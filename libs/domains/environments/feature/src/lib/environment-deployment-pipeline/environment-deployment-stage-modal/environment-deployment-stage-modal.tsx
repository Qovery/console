import { type DeploymentStageRequest, type DeploymentStageResponse } from 'qovery-typescript-axios'
import { type FormEventHandler, useEffect, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { InputText, InputTextArea, ModalCrud, useModal } from '@qovery/shared/ui'
import { useCreateDeploymentStage } from '../../hooks/use-create-deployment-stage/use-create-deployment-stage'
import { useEditDeploymentStage } from '../../hooks/use-edit-deployment-stage/use-edit-deployment-stage'

export interface EnvironmentDeploymentStageModalProps {
  environmentId: string
  onClose: () => void
  stage?: DeploymentStageResponse
}

interface StageFormValues {
  name: string
  description: string
}

export function EnvironmentDeploymentStageModal({
  environmentId,
  onClose,
  stage,
}: EnvironmentDeploymentStageModalProps) {
  const methods = useForm<StageFormValues>({
    defaultValues: {
      name: stage?.name ?? '',
      description: stage?.description ?? '',
    },
    mode: 'onChange',
  })
  const { control, formState } = methods
  const { enableAlertClickOutside } = useModal()
  const { mutateAsync: createDeploymentStage } = useCreateDeploymentStage()
  const { mutateAsync: editDeploymentStage } = useEditDeploymentStage()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    enableAlertClickOutside(formState.isDirty)
  }, [enableAlertClickOutside, formState.isDirty])

  const onSubmit: FormEventHandler<HTMLFormElement> = methods.handleSubmit(async (data) => {
    setLoading(true)

    const payload: DeploymentStageRequest = {
      name: data.name,
      description: data.description,
    }

    try {
      if (stage) {
        await editDeploymentStage({ stageId: stage.id, payload })
      } else {
        await createDeploymentStage({ environmentId, payload })
      }

      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={stage ? 'Edit stage' : 'Create stage'}
        isEdit={!!stage}
        loading={loading}
        onSubmit={onSubmit}
        onClose={onClose}
      >
        <Controller
          name="name"
          control={control}
          rules={{
            required: 'Please enter a name.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              error={error?.message}
              label="Name"
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <InputTextArea
              className="mb-6"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              error={error?.message}
              label="Description (optional)"
            />
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default EnvironmentDeploymentStageModal

import { type OrganizationWebhookCreateRequest, type OrganizationWebhookResponse } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useCreateWebhook, useEditWebhook } from '@qovery/domains/organizations/feature'
import { useModal } from '@qovery/shared/ui'
import WebhookCrudModal from '../../../ui/page-organization-webhooks/webhook-crud-modal/webhook-crud-modal'

export const SECRET_VALUE_UNCHANGED = 'SECRET_VALUE_UNCHANGED'

export interface WebhookCrudModalFeatureProps {
  organizationId: string
  closeModal: () => void
  webhook?: OrganizationWebhookResponse
}

export function WebhookCrudModalFeature({ organizationId, closeModal, webhook }: WebhookCrudModalFeatureProps) {
  const { enableAlertClickOutside } = useModal()
  const { mutateAsync: createWebhook, isLoading: isLoadingCreateWebhook } = useCreateWebhook()
  const { mutateAsync: editWebhook, isLoading: isLoadingEditWebhook } = useEditWebhook()

  const hasExistingSecret = Boolean(webhook?.target_secret_set)
  const [secretTouched, setSecretTouched] = useState(false)
  const [showSecretClearWarning, setShowSecretClearWarning] = useState(false)

  useEffect(() => {
    setSecretTouched(false)
    setShowSecretClearWarning(false)
  }, [webhook?.id])

  const methods = useForm<OrganizationWebhookCreateRequest>({
    mode: 'all',
    defaultValues: {
      kind: webhook?.kind ?? undefined,
      environment_types_filter: webhook?.environment_types_filter ?? [],
      project_names_filter: webhook?.project_names_filter ?? [],
      events: webhook?.events ?? [],
      description: webhook?.description ?? '',
      target_url: webhook?.target_url ?? '',
      target_secret: '',
    },
  })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const onSubmit = methods.handleSubmit(async (data) => {
    let secretToSend = data.target_secret
    if (hasExistingSecret && !secretTouched) {
      secretToSend = SECRET_VALUE_UNCHANGED
    }

    const trimmedData = {
      ...data,
      target_url: data.target_url.trim(),
      target_secret: secretToSend,
    }
    try {
      if (webhook) {
        await editWebhook({
          organizationId,
          webhookId: webhook.id,
          webhookRequest: { ...webhook, ...trimmedData },
        })
        closeModal()
      } else {
        await createWebhook({
          organizationId,
          webhookRequest: trimmedData,
        })
        closeModal()
      }
    } catch (error) {
      console.error(error)
    }
  })

  const onSecretChange = (onChange: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecretTouched(true)
    const newValue = e.target.value
    setShowSecretClearWarning(hasExistingSecret && newValue === '')
    onChange(newValue)
  }

  return (
    <FormProvider {...methods}>
      <WebhookCrudModal
        closeModal={closeModal}
        onSubmit={onSubmit}
        isEdition={Boolean(webhook)}
        isLoading={isLoadingCreateWebhook || isLoadingEditWebhook}
        hasExistingSecret={hasExistingSecret}
        secretTouched={secretTouched}
        onSecretChange={onSecretChange}
        showSecretClearWarning={showSecretClearWarning}
      />
    </FormProvider>
  )
}

export default WebhookCrudModalFeature

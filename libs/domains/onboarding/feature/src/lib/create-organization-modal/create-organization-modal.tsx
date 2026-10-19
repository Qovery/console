import { useNavigate } from '@tanstack/react-router'
import { PlanEnum } from 'qovery-typescript-axios'
import { useRef, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useCreateOrganization } from '@qovery/domains/organizations/feature'
import { useCreateProject } from '@qovery/domains/projects/feature'
import { useAuth } from '@qovery/shared/auth'
import { Callout, Icon, InputText, ModalCrud, toast, toastError, useModal } from '@qovery/shared/ui'

export interface CreateOrganizationModalProps {
  onClose: () => void
  onCreated?: () => void
  setModalDismissible?: (dismissible: boolean) => void
}

export function CreateOrganizationModal({
  onClose,
  onCreated = onClose,
  setModalDismissible,
}: CreateOrganizationModalProps) {
  const navigate = useNavigate()
  const { user, getAccessTokenSilently } = useAuth()
  const modal = useModal()
  const { mutateAsync: createOrganization } = useCreateOrganization()
  const { mutateAsync: createProject } = useCreateProject({ silently: true })
  const methods = useForm({ mode: 'onChange', defaultValues: { name: '' } })
  const pendingOrganizationId = useRef<string | undefined>(undefined)
  const projectCreated = useRef(false)
  const submitting = useRef(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const changeDismissible = setModalDismissible ?? modal.setModalDismissible

  const onSubmit = methods.handleSubmit(async ({ name }) => {
    if (submitting.current) return
    submitting.current = true
    setLoading(true)
    setError(false)
    changeDismissible(false)

    try {
      if (!pendingOrganizationId.current) {
        const organization = await createOrganization({
          organizationRequest: {
            name: name.trim(),
            plan: PlanEnum.BUSINESS_2025,
            admin_emails: user?.email ? [user.email] : [],
          },
        })
        pendingOrganizationId.current = organization.id
      }

      await getAccessTokenSilently({ cacheMode: 'off' })
      if (!projectCreated.current) {
        await createProject({
          organizationId: pendingOrganizationId.current,
          projectRequest: { name: 'main' },
        })
        projectCreated.current = true
      }
      modal.closeModal()
      onCreated()
      toast('success', 'Your organization and project have been created')
      await navigate({
        to: '/organization/$organizationId/overview',
        params: { organizationId: pendingOrganizationId.current },
      }).catch((error) => {
        toastError(error as Error)
        onClose()
      })
    } catch {
      setError(true)
    } finally {
      submitting.current = false
      setLoading(false)
      changeDismissible(true)
    }
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Create organization"
        onClose={() => {
          if (!submitting.current) onClose()
        }}
        onSubmit={onSubmit}
        loading={loading}
      >
        <Controller
          name="name"
          rules={{ validate: (value) => !!value.trim() || 'Please enter your organization name.' }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              {...field}
              label="Organization name"
              error={error?.message}
              disabled={loading}
              readOnly={!!pendingOrganizationId.current}
            />
          )}
        />
        {error && (
          <Callout.Root color="red" className="mt-4" role="alert">
            <Callout.Icon>
              <Icon iconName="circle-exclamation" />
            </Callout.Icon>
            <Callout.Text>
              {pendingOrganizationId.current
                ? 'Your organization was created. Try again to finish setting up its project.'
                : 'Your organization could not be created. Please try again.'}
            </Callout.Text>
          </Callout.Root>
        )}
      </ModalCrud>
    </FormProvider>
  )
}

export default CreateOrganizationModal

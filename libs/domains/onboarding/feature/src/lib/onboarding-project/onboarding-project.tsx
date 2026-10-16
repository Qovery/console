import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useOrganizations } from '@qovery/domains/organizations/feature'
import { Modal } from '@qovery/shared/ui'
import { CreateOrganizationModal } from '../create-organization-modal/create-organization-modal'

export function OnboardingProject({ previousUrl }: { previousUrl?: string }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)
  const { data: organizations = [] } = useOrganizations()

  const onClose = () => {
    if (previousUrl) {
      navigate({ href: previousUrl, replace: true })
    } else if (organizations.length > 0) {
      navigate({
        to: '/organization/$organizationId/overview',
        params: { organizationId: organizations[0].id },
        replace: true,
      })
    } else {
      navigate({ to: '/', replace: true })
    }
  }

  return (
    <Modal externalOpen={open} setExternalOpen={(open) => !open && onClose()}>
      <CreateOrganizationModal onClose={onClose} onCreated={() => setOpen(false)} />
    </Modal>
  )
}

export default OnboardingProject

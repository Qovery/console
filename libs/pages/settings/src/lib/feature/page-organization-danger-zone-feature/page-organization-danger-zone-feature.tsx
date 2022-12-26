import { Organization } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteOrganization, selectOrganizationById } from '@qovery/domains/organization'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import PageOrganizationDangerZone from '../../ui/page-organization-danger-zone/page-organization-danger-zone'

export function PageOrganizationDangerZoneFeature() {
  const { organizationId = '' } = useParams()
  useDocumentTitle('Danger zone - Organization settings')

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)

  const organization = useSelector<RootState, Organization | undefined>((state) =>
    selectOrganizationById(state, organizationId)
  )

  const deleteOrganizationAction = () => {
    setLoading(true)

    dispatch(deleteOrganization({ organizationId }))
      .unwrap()
      .then(() => navigate('/'))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false))
  }

  return (
    <PageOrganizationDangerZone
      deleteOrganization={deleteOrganizationAction}
      organization={organization}
      loading={loading}
    />
  )
}

export default PageOrganizationDangerZoneFeature

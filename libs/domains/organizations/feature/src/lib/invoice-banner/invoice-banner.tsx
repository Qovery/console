import { useFeatureFlagEnabled } from 'posthog-js/react'
import { InvoiceStatusEnum } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUserRole } from '@qovery/shared/iam/feature'
import { SETTINGS_BILLING_SUMMARY_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { Banner } from '@qovery/shared/ui'
import useInvoices from '../hooks/use-invoices/use-invoices'

export const InvoiceBanner = () => {
  const navigate = useNavigate()
  const { organizationId = '' } = useParams()
  const hideInvoiceBanner = useFeatureFlagEnabled('hide_invoice_banner')
  const { roles } = useUserRole()
  const { data: invoices, isLoading } = useInvoices({ organizationId })
  const unpaidInvoices = invoices?.filter((invoice) => invoice.status === InvoiceStatusEnum.NOT_PAID)

  const isAdminOrOwnerOfCompany = useMemo(
    () =>
      roles.some((role) => role.includes(`organization:${organizationId}:admin`)) ||
      roles.some((role) => role.includes(`organization:${organizationId}:owner`)),
    [roles, organizationId]
  )

  const onClick = () => {
    navigate(SETTINGS_URL(organizationId) + SETTINGS_BILLING_SUMMARY_URL)
  }

  if (unpaidInvoices?.length === 0 || isLoading || !isAdminOrOwnerOfCompany || hideInvoiceBanner) {
    return null
  }

  return (
    <Banner color="yellow" buttonIconRight="arrow-right" buttonLabel="View invoices" onClickButton={onClick}>
      <p>You have overdue invoices. Please update your payment method to avoid service interruption</p>
    </Banner>
  )
}

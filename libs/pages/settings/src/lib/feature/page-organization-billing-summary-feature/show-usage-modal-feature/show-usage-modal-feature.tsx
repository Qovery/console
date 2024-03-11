import { type OrganizationCurrentCost } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useGenerateBillingUsageReport, useOrganization } from '@qovery/domains/organizations/feature'
import { useModal } from '@qovery/shared/ui'
import ShowUsageModal, {
  getReportPeriods,
} from '../../../ui/page-organization-billing-summary/show-usage-modal/show-usage-modal'
import ShowUsageValueModal from '../../../ui/page-organization-billing-summary/show-usage-value-modal/show-usage-value-modal'

export interface ShowUsageModalFeatureProps {
  organizationId: string
  currentCost: OrganizationCurrentCost
}

export function ShowUsageModalFeature({ organizationId, currentCost }: ShowUsageModalFeatureProps) {
  const methods = useForm<{ expires: number; report_period: string }>({
    defaultValues: {
      expires: 24,
      report_period: 'current_month',
    },
    mode: 'all',
  })

  const { data: organization } = useOrganization({ organizationId })
  const { mutateAsync: usageBillingReport, isLoading: isLoadingUsageBillingReport } = useGenerateBillingUsageReport()
  const { openModal, closeModal } = useModal()

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!organization) return

    const reportPeriods = getReportPeriods(organization, currentCost?.renewal_at)
    const selectedReportPeriod = reportPeriods.find((rp) => rp.option.value === data.report_period)

    if (selectedReportPeriod !== undefined) {
      try {
        const res = await usageBillingReport({
          organizationId,
          usageReportRequest: {
            from: selectedReportPeriod.from,
            to: selectedReportPeriod.to,
            report_expiration_in_seconds: methods.getValues('expires'),
          },
        })
        openModal({
          content: (
            <ShowUsageValueModal onClose={closeModal} url={res.report_url ?? ''} url_expires_in_hours={data.expires} />
          ),
        })
      } catch (error) {
        console.error(error)
      }
    } else {
      console.error('Selected report period is undefined')
    }
  })

  return (
    <FormProvider {...methods}>
      <ShowUsageModal
        organizationId={organizationId}
        renewalAt={currentCost?.renewal_at}
        onSubmit={onSubmit}
        onClose={closeModal}
        loading={isLoadingUsageBillingReport}
      />
    </FormProvider>
  )
}

export default ShowUsageModalFeature

import { eachMonthOfInterval, isAfter, isBefore, isEqual } from 'date-fns'
import { type OrganizationCurrentCost } from 'qovery-typescript-axios'
import { type Organization } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'
import { useModal } from '@qovery/shared/ui'
import { Callout, Icon, InputSelect, InputText, ModalCrud } from '@qovery/shared/ui'
import { setDayOfTheMonth } from '@qovery/shared/util-dates'
import { useGenerateBillingUsageReport } from '../../hooks/use-generate-billing-usage-report/use-generate-billing-usage-report'
import { useOrganization } from '../../hooks/use-organization/use-organization'
import ShowUsageValueModal from './show-usage-value-modal/show-usage-value-modal'

export interface ShowUsageModalProps {
  organizationId: string
  renewalAt?: string | null
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
}

export function getReportPeriods({
  organization,
  orgRenewalAt,
}: {
  organization?: Organization
  orgRenewalAt?: string | null
}) {
  if (!organization) return []

  const orgCreatedAt = new Date(organization.created_at)
  orgCreatedAt.setHours(0, 0, 0, 0)
  const renewalDayOfTheMonth = new Date(orgRenewalAt ? orgRenewalAt : organization.created_at).getDate()

  const start = orgCreatedAt
  const now = new Date()

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
    }).format(date)

  const periods = eachMonthOfInterval({
    start,
    end: now,
  })

  return (
    periods
      .map((p) => setDayOfTheMonth(p, renewalDayOfTheMonth))
      // First renewal date can be below the creation date in some case like:
      // - Creation date: 31 Mars
      // - Renewal date: 4 April
      .filter((p) => (isAfter(p, orgCreatedAt) || isEqual(p, orgCreatedAt)) && isBefore(p, now))
      .map((p, index, arr) => {
        return index === arr.length - 1
          ? {
              label: `${formatDate(p)} to now`,
              value: JSON.stringify({
                from: p.toISOString(),
              }),
            }
          : {
              label: `${formatDate(p)} to ${formatDate(arr[index + 1])}`,
              value: JSON.stringify({
                from: p.toISOString(),
                to: arr[index + 1].toISOString(),
              }),
            }
      })
      .slice(-12)
      .reverse()
  )
}

export function ShowUsageModal({ organizationId, renewalAt, onSubmit, onClose, loading }: ShowUsageModalProps) {
  const { control } = useFormContext()

  const { data: organization } = useOrganization({ organizationId })
  const reportPeriods = getReportPeriods({ organization, orgRenewalAt: renewalAt })

  return (
    <ModalCrud
      title="Show usage"
      description="Get detailed analytics about your usage and billing."
      submitLabel="Generate report"
      howItWorks={
        <>
          <p>
            Qovery provides detailed analytics about your usage and billing. You can use this information to optimize
            your usage and reduce your costs. By generating a dashboard you will get a URL to access your usage and
            billing analytics. The dashboard is a snapshot of your usage and billing at the time of generation. Generate
            a new dashboard to get the latest analytics.
          </p>
          <br />
          <p>
            Don't share the dashboard URL with anyone you don't trust. The URL provides access to your usage and billing
            analytics.
          </p>
          <br />
          <p>
            The generated dashboard is available for 24 hours (per default). After that, you will need to generate a new
            dashboard.
          </p>
          <br />
          <p>
            <b>Why the report period does not start from the beginning of the month?</b> The report period starts from
            the day of your monthly billing cycle. For example, if your billing cycle starts on the 15th of each month,
            the report period will start from the 15th of the previous month to the 15th of the current month.
          </p>
        </>
      }
      onSubmit={onSubmit}
      onClose={onClose}
      loading={loading}
    >
      <Callout.Root className="mb-5" color="yellow">
        <Callout.Icon>
          <Icon iconName="triangle-exclamation" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text className="flex items-center">
          The report generation could take a few seconds, please be patient.
        </Callout.Text>
      </Callout.Root>
      <Controller
        name="report_period"
        control={control}
        defaultValue={reportPeriods[0]?.value}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            dataTestId="input-select-report-period"
            label="Report period"
            className="mb-5"
            options={reportPeriods}
            onChange={field.onChange}
            value={field.value}
            error={error?.message}
            portal
          />
        )}
      />
      <Controller
        name="expires"
        control={control}
        rules={{
          required: 'Please enter an expiration time in hours between 1 and 168 (7 days).',
          pattern: {
            // eslint-disable-next-line no-useless-escape
            value: /^(?:1[0-6][0-8]|[1-9][0-9]?|168)$/gm,
            message: 'The value must be between 1 hour and 168 hours (7 days)',
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            dataTestId="input-expires"
            className="mb-5"
            name={field.name}
            type="number"
            onChange={field.onChange}
            value={field.value}
            label="Link expiration time (in hours)"
            error={error?.message}
          />
        )}
      />
    </ModalCrud>
  )
}

export interface ShowUsageModalFeatureProps {
  organizationId: string
  currentCost: OrganizationCurrentCost
}

export function ShowUsageModalFeature({ organizationId, currentCost }: ShowUsageModalFeatureProps) {
  const methods = useForm<{ expires: number; report_period: string }>({
    defaultValues: {
      expires: 24,
    },
    mode: 'all',
  })

  const { data: organization } = useOrganization({ organizationId })
  const { mutateAsync: usageBillingReport, isLoading: isLoadingUsageBillingReport } = useGenerateBillingUsageReport()
  const { openModal, closeModal } = useModal()

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!organization) return

    try {
      const selectedReportPeriod = JSON.parse(data.report_period)

      const res = await usageBillingReport({
        organizationId,
        usageReportRequest: {
          from: new Date(new Date(selectedReportPeriod.from).getTime() + 24 * 60 * 60 * 1000).toISOString(),
          to: selectedReportPeriod.to
            ? new Date(new Date(selectedReportPeriod.to).getTime() + 24 * 60 * 60 * 1000).toISOString()
            : new Date().toISOString(),
          report_expiration_in_seconds: methods.getValues('expires') * 60 * 60, // hours to seconds
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
  })

  return (
    <FormProvider {...methods}>
      <ShowUsageModal
        organizationId={organizationId}
        renewalAt={currentCost.renewal_at}
        onSubmit={onSubmit}
        onClose={closeModal}
        loading={isLoadingUsageBillingReport}
      />
    </FormProvider>
  )
}

export default ShowUsageModalFeature

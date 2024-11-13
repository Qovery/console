import { eachMonthOfInterval, isAfter, isBefore, isEqual } from 'date-fns'
import { type Organization } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { Callout, Icon, InputSelect, InputText, ModalCrud } from '@qovery/shared/ui'
import { setDayOfTheMonth } from '@qovery/shared/util-dates'

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

export default ShowUsageModal

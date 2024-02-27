import { type Organization } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { InputSelect, InputText, ModalCrud } from '@qovery/shared/ui'

export interface ShowUsageModalProps {
  organizationId: string
  renewalAt?: string | null
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
}

export class ReportPeriod {
  from: string
  to: string
  option: ReportPeriodOption

  constructor(from: string, to: string, option: ReportPeriodOption) {
    this.from = from
    this.to = to
    this.option = option
  }
}

export class ReportPeriodOption {
  label: string
  value: string

  constructor(label: string, value: string) {
    this.label = label
    this.value = value
  }
}

export function getReportPeriods(organization: Organization, orgRenewalAt: string | null | undefined): ReportPeriod[] {
  const date = new Date()
  date.setMonth(date.getMonth(), new Date(orgRenewalAt ? orgRenewalAt : organization.created_at).getDate())
  date.setHours(0, 0, 0, 0)

  const currentDateStr = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(date)

  const reportPeriods = [
    new ReportPeriod(
      date.toISOString(),
      new Date().toISOString(),
      new ReportPeriodOption(`${currentDateStr} to Now`, 'current_month')
    ),
  ]

  if (orgRenewalAt) {
    const orgCreatedAtDate = new Date(organization.created_at)

    // get last 12 months from renewalAt - 1 month if the month date is greater than org.created_at
    for (let i = 1; i <= 12; i++) {
      const renewalAtDate = new Date(orgRenewalAt)
      const date = new Date()
      date.setMonth(date.getMonth() - i, renewalAtDate.getDate())
      date.setHours(0, 0, 0, 0)

      if (date.getTime() < orgCreatedAtDate.getTime()) {
        break
      }

      const nextMonthDate = new Date(date)
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1)

      // date formatting to Month, Day, Year
      const dateToFormatx = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
      }).format(new Date(date))

      const nextMonthDateToFormat = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
      }).format(new Date(nextMonthDate))

      reportPeriods.push(
        new ReportPeriod(
          date.toISOString(),
          nextMonthDate.toISOString(),
          new ReportPeriodOption(`${dateToFormatx} to ${nextMonthDateToFormat}`, date.toISOString())
        )
      )
    }
  }

  return reportPeriods
}

export function ShowUsageModal({ organizationId, renewalAt, onSubmit, onClose, loading }: ShowUsageModalProps) {
  const { control } = useFormContext()

  const { data: organization } = useOrganization({ organizationId })
  const reportPeriods = getReportPeriods(organization as Organization, renewalAt)

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
      <Controller
        name="report_period"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            dataTestId="input-select-report-period"
            label="Report period"
            className="mb-6"
            options={reportPeriods.map((rp) => {
              return { label: rp.option.label, value: rp.option.value }
            })}
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

import { Badge, Button, Heading, Icon, Section } from '@qovery/shared/ui'

export interface BlueprintUpdateReviewModalProps {
  targetVersion: string
  releaseNotesUrl?: string
  changesSummary: {
    added: number
    changed: number
    removed: number
  }
  onCancel: () => void
  onReview: () => void
}

export function BlueprintUpdateReviewModal({
  targetVersion,
  releaseNotesUrl,
  changesSummary,
  onCancel,
  onReview,
}: BlueprintUpdateReviewModalProps) {
  return (
    <Section className="gap-6 p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Heading level={1}>{`Update to ${targetVersion} available`}</Heading>
          <p className="text-sm text-neutral-subtle">
            This update improves bucket performance for large object transfers and hardens IAM permission scoping. See
            the full{' '}
            {releaseNotesUrl ? (
              <a
                href={releaseNotesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="decoration-info text-info underline underline-offset-2"
              >
                release notes
              </a>
            ) : (
              <span className="decoration-info text-info underline underline-offset-2">release notes</span>
            )}{' '}
            for more details.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-neutral-subtle">Changes</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge size="base" variant="surface" color="green" className="gap-1 font-medium">
              <Icon iconName="circle-plus" iconStyle="regular" className="text-xs" />
              {`${changesSummary.added} fields added`}
            </Badge>
            <Badge size="base" variant="surface" color="yellow" className="gap-1 font-medium">
              <Icon iconName="pen" iconStyle="regular" className="text-xs" />
              {`${changesSummary.changed} fields changed`}
            </Badge>
            <Badge size="base" variant="surface" color="red" className="gap-1 font-medium">
              <Icon iconName="circle-minus" iconStyle="regular" className="text-xs" />
              {`${changesSummary.removed} field${changesSummary.removed > 1 ? 's' : ''} removed`}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="lg" color="brand" variant="solid" radius="rounded" onClick={onReview}>
          Review & update
        </Button>
        <Button size="lg" color="neutral" variant="plain" onClick={onCancel}>
          Not interested
        </Button>
      </div>
    </Section>
  )
}

export default BlueprintUpdateReviewModal

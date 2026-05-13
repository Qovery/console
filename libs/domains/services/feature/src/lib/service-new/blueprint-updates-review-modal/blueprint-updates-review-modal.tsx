import { Badge, Button, Heading, Icon, Section } from '@qovery/shared/ui'

export interface BlueprintAvailableUpdate {
  id: string
  title: string
  description: string
  added: number
  removed: number
  changelogUrl?: string
  onReview: () => void
}

export interface BlueprintUpdatesReviewModalProps {
  title: string
  description: string
  updates: BlueprintAvailableUpdate[]
}

function UpdateCard({ update }: { update: BlueprintAvailableUpdate }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-neutral bg-surface-neutral p-4 shadow-Cards">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-neutral">{update.title}</p>
        <p className="text-ssm text-neutral-subtle">{update.description}</p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button size="sm" color="neutral" variant="outline" radius="rounded" onClick={update.onReview}>
            Review & update
          </Button>
          <a href={update.changelogUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" color="neutral" variant="plain" radius="rounded" className="gap-1">
              Changelog
              <Icon iconName="arrow-up-right" iconStyle="regular" className="text-xs" />
            </Button>
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Badge size="base" variant="surface" color="green" className="gap-1 font-medium">
            <Icon iconName="circle-plus" iconStyle="regular" className="text-xs" />
            {update.added}
          </Badge>
          <Badge size="base" variant="surface" color="red" className="gap-1 font-medium">
            <Icon iconName="circle-minus" iconStyle="regular" className="text-xs" />
            {update.removed}
          </Badge>
        </div>
      </div>
    </div>
  )
}

export function BlueprintUpdatesReviewModal({ title, description, updates }: BlueprintUpdatesReviewModalProps) {
  return (
    <Section className="gap-4 p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Heading level={1}>{title}</Heading>
          <p className="text-sm text-neutral-subtle">{description}</p>
        </div>
        <div className="flex flex-col gap-3">
          {updates.map((update) => (
            <UpdateCard key={update.id} update={update} />
          ))}
        </div>
      </div>
    </Section>
  )
}

export default BlueprintUpdatesReviewModal

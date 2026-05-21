import { Badge, Heading, Icon, Section } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { useLocalStorage } from '@qovery/shared/util-hooks'
import { useChangelogs } from '@qovery/shared/webflow/feature'

const SEEN_CHANGELOG_DATE_KEY = 'qovery-seen-changelog-date'
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function SectionChangelog() {
  const { data: changelogs = [] } = useChangelogs()
  const [seenChangelogDate, setSeenChangelogDate] = useLocalStorage<string | null>(SEEN_CHANGELOG_DATE_KEY, null)

  const latestChangelog = changelogs[0]
  const isWithinOneWeek =
    latestChangelog !== undefined && Date.now() - new Date(latestChangelog.firstPublishedAt).getTime() < ONE_WEEK_MS
  const hasNewChangelog =
    isWithinOneWeek && (seenChangelogDate === null || latestChangelog.firstPublishedAt > seenChangelogDate)

  if (changelogs.length === 0) {
    return null
  }

  return (
    <Section className="flex flex-col gap-3">
      <Heading className="flex items-center gap-2">
        <Icon iconName="bullhorn" className="text-sm text-neutral-subtle" />
        Changelog
      </Heading>
      {changelogs.map((changelog, index) => (
        <a
          key={changelog.url}
          href={changelog.url}
          title={changelog.name}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            if (index === 0 && hasNewChangelog) {
              setSeenChangelogDate(changelog.firstPublishedAt)
            }
          }}
          className="flex flex-col gap-2 rounded-lg border border-neutral p-4 text-neutral transition-colors hover:bg-surface-neutral-subtle"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm">{changelog.name}</p>
            {index === 0 && hasNewChangelog && (
              <Badge variant="surface" color="brand" size="sm" className="shrink-0">
                New
              </Badge>
            )}
          </div>
          <span className="text-ssm text-neutral-subtle">
            {dateFullFormat(changelog.firstPublishedAt, 'UTC', 'dd MMM, Y')}
          </span>
        </a>
      ))}
    </Section>
  )
}

export default SectionChangelog

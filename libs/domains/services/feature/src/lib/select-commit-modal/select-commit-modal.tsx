import { clsx } from 'clsx'
import { type Commit } from 'qovery-typescript-axios'
import { type ReactNode, useMemo, useState } from 'react'
import {
  Button,
  Icon,
  InputSearch,
  LegacyAvatar,
  LegacyAvatarStyle,
  RadioGroup,
  ScrollShadowWrapper,
  TagCommit,
} from '@qovery/shared/ui'
import { dateToFormat, timeAgo } from '@qovery/shared/util-dates'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import {
  type UseLastDeployedCommitProps,
  useLastDeployedCommit,
} from '../hooks/use-last-deployed-commit/use-last-deployed-commit'

export type SelectCommitModalProps = {
  title: string
  description: string
  submitLabel: string
  children: ReactNode
  onCancel: () => void
  onSubmit: (targetCommitId: string) => void
} & UseLastDeployedCommitProps

export function SelectCommitModal({
  title,
  description,
  submitLabel,
  children,
  onCancel,
  onSubmit,
  ...props
}: SelectCommitModalProps) {
  const { data, isLoading } = useLastDeployedCommit(props)

  const [search, setSearch] = useState('')
  const [targetCommitId, setTargetCommitId] = useState<string | undefined>()

  const commitsByDay = useMemo(
    () =>
      data.commits?.reduce<Record<string, Commit[]>>((acc, obj) => {
        const key = new Date(obj['created_at']).toDateString()
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(obj)
        return acc
      }, {}) ?? {},
    [data.commits]
  )

  const filterCommits: Record<string, Commit[]> = Object.fromEntries(
    Object.entries(commitsByDay)
      .map(([date, commits]) => {
        return [
          date,
          commits.filter(
            (commit) =>
              commit.message.toLowerCase().includes(search.toLowerCase()) ||
              commit.git_commit_id.toLowerCase().includes(search.toLowerCase())
          ),
        ]
      })
      .filter(([, commits]) => commits.length)
  )

  if (!data) {
    return null
  }

  return (
    <div className="flex flex-col gap-6 p-5">
      <div className="flex flex-col gap-2 text-sm">
        <h2 className="h4 max-w-sm truncate text-neutral-400 dark:text-neutral-50">{title}</h2>
        <p className="text-neutral-350 dark:text-neutral-50">{description}</p>
        {children}
      </div>

      <InputSearch placeholder="Search by commit message or commit id" onChange={setSearch} />

      {isLoading || Object.keys(filterCommits).length > 0 ? (
        <RadioGroup.Root onValueChange={setTargetCommitId}>
          <ScrollShadowWrapper className="max-h-[440px]">
            {Object.entries(filterCommits).map(([date, commits]) => (
              <div key={date} className="pl-2">
                <div className="relative pl-5 text-sm font-medium text-neutral-350">
                  <Icon
                    iconName="code-commit"
                    className="absolute left-0 top-1 -translate-x-1/2 text-neutral-300 dark:text-neutral-350"
                  />
                  {pluralize(commits.length, 'Commit')} on {dateToFormat(date, 'MMM dd, yyyy')}
                </div>
                <div className="border-l border-neutral-250 pb-5 pl-5 pt-3 dark:border-neutral-350">
                  {commits.map(
                    (
                      { author_name, author_avatar_url, commit_page_url, created_at, git_commit_id, message },
                      index
                    ) => {
                      const isSelected = targetCommitId === git_commit_id
                      const isSelectedSiblings = targetCommitId && commits[index - 1]?.git_commit_id === targetCommitId
                      const isCurrentDeployedCommit = data.deployedCommit.git_commit_id === git_commit_id

                      return (
                        <label
                          key={git_commit_id}
                          className={twMerge(
                            '-mt-px flex w-full flex-row gap-3 border border-neutral-250 p-3 first:rounded-t-md last:rounded-b-md dark:border-neutral-350',
                            isCurrentDeployedCommit ? 'bg-neutral-100 dark:bg-neutral-500' : 'cursor-pointer',
                            clsx({
                              'border-brand-500 bg-brand-50 dark:bg-neutral-600': isSelected,
                              'border-t-transparent': isSelectedSiblings,
                            })
                          )}
                        >
                          <div>
                            {!isCurrentDeployedCommit ? (
                              <RadioGroup.Item value={git_commit_id} />
                            ) : (
                              <RadioGroup.Item value={git_commit_id} disabled checked variant="check" />
                            )}
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col items-start gap-1 text-sm">
                            <a
                              href={commit_page_url}
                              target="_blank"
                              rel="noreferrer"
                              className={twMerge(
                                'max-w-full truncate font-medium text-neutral-400 hover:text-brand-500 dark:text-neutral-50',
                                clsx({
                                  'text-neutral-350': isCurrentDeployedCommit,
                                })
                              )}
                            >
                              {message}
                            </a>
                            <span className="text-neutral-350 dark:text-neutral-50">
                              committed {timeAgo(new Date(created_at))} ago
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1.5">
                              <LegacyAvatar
                                size={28}
                                style={LegacyAvatarStyle.STROKED}
                                firstName={author_name}
                                url={author_avatar_url}
                              />
                              <TagCommit commitId={git_commit_id} />
                            </div>
                            <span
                              className={clsx(
                                'text-xs',
                                isCurrentDeployedCommit ? 'text-neutral-400 dark:text-neutral-50' : 'text-brand-500'
                              )}
                            >
                              {
                                isSelected ? (
                                  'Selected version'
                                ) : isCurrentDeployedCommit ? (
                                  'Current version'
                                ) : (
                                  <>&nbsp;</>
                                ) /** XXX: Avoid flickering. Ideally Avatar and Commit should be rewritten to be smaller **/
                              }
                            </span>
                          </div>
                        </label>
                      )
                    }
                  )}
                </div>
              </div>
            ))}
          </ScrollShadowWrapper>
        </RadioGroup.Root>
      ) : (
        <div className="px-3 py-6 text-center">
          <Icon iconName="wave-pulse" className="text-neutral-350" />
          <p className="mt-1 text-xs font-medium text-neutral-350">No result for this search</p>
        </div>
      )}
      <div className="flex justify-end gap-3">
        <Button variant="outline" color="neutral" size="lg" onClick={() => onCancel()}>
          Cancel
        </Button>
        <Button disabled={!targetCommitId} size="lg" onClick={() => onSubmit(targetCommitId!)}>
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}

export default SelectCommitModal

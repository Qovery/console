import { clsx } from 'clsx'
import { type ApplicationGitRepository } from 'qovery-typescript-axios'
import { type Commit } from 'qovery-typescript-axios'
import { type ComponentPropsWithoutRef, useMemo, useState } from 'react'
import { type ServiceType } from '@qovery/domains/services/data-access'
import {
  Avatar,
  AvatarStyle,
  Button,
  Icon,
  IconAwesomeEnum,
  InputSearch,
  RadioGroup,
  ScrollShadowWrapper,
  TagCommit,
} from '@qovery/shared/ui'
import { dateToFormat, timeAgo } from '@qovery/shared/util-dates'
import { twMerge } from '@qovery/shared/util-js'
import { useLastDeployedCommit } from '../hooks/use-last-deployed-commit/use-last-deployed-commit'

export interface SelectCommitModalProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onSubmit'> {
  description: string
  submitLabel: string
  gitRepository: ApplicationGitRepository
  serviceId: string
  serviceType: Extract<ServiceType, 'APPLICATION' | 'JOB' | 'CRON_JOB' | 'LIFECYCLE_JOB' | 'HELM'>
  onCancel: () => void
  onSubmit: (targetCommitId: string) => void
}

export function SelectCommitModal({
  title,
  description,
  submitLabel,
  gitRepository,
  serviceId,
  serviceType,
  children,
  onCancel,
  onSubmit,
}: SelectCommitModalProps) {
  const { data, isLoading } = useLastDeployedCommit({ gitRepository, serviceId, serviceType })

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
      <div className="flex flex-col gap-2 text-sm text-neutral-350">
        <h2 className="h4 text-neutral-400 max-w-sm truncate mb-1">{title}</h2>
        <p>{description}</p>
        {children}
      </div>

      <InputSearch placeholder="Search by commit message or commit id" onChange={setSearch} />

      {isLoading || Object.keys(filterCommits).length > 0 ? (
        <RadioGroup.Root onValueChange={setTargetCommitId}>
          <ScrollShadowWrapper className="max-h-[440px]">
            {Object.entries(filterCommits).map(([date, commits]) => (
              <div key={date} className="pl-2">
                <div className="text-sm pl-5 text-neutral-350 font-medium relative">
                  <Icon
                    name={IconAwesomeEnum.CODE_COMMIT}
                    className="absolute left-0 text-neutral-300 -translate-x-1/2"
                  />
                  Commit{commits.length > 1 ? 's' : ''} on {dateToFormat(date, 'MMM dd, yyyy')}
                </div>
                <div className="border-l border-neutral-250 pt-3 pl-5 pb-5">
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
                            'flex flex-row gap-3 w-full p-3 border border-neutral-250 -mt-px first:rounded-t-md last:rounded-b-md',
                            isCurrentDeployedCommit ? 'bg-neutral-100' : 'cursor-pointer',
                            clsx({
                              'bg-brand-50 border-brand-500': isSelected,
                              'border-t-transparent': isSelectedSiblings,
                            })
                          )}
                        >
                          <div>
                            {!isCurrentDeployedCommit ? (
                              <RadioGroup.Item value={git_commit_id} />
                            ) : (
                              <div className="pr-5" />
                            )}
                          </div>
                          <div className="flex flex-col items-start flex-1 min-w-0 text-sm gap-1">
                            <a
                              href={commit_page_url}
                              target="_blank"
                              rel="noreferrer"
                              className={twMerge(
                                'font-medium text-neutral-400 hover:text-brand-500 truncate max-w-full',
                                clsx({
                                  'text-neutral-350': isCurrentDeployedCommit,
                                })
                              )}
                            >
                              {message}
                            </a>
                            <span className="text-neutral-350">committed {timeAgo(new Date(created_at))} ago</span>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1.5">
                              <Avatar
                                size={28}
                                style={AvatarStyle.STROKED}
                                firstName={author_name}
                                url={author_avatar_url}
                              />
                              <TagCommit commitId={git_commit_id} />
                            </div>
                            <span
                              className={clsx(
                                'text-xs',
                                isCurrentDeployedCommit ? 'text-neutral-400' : 'text-brand-500'
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
        <div className="text-center px-3 py-6">
          <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-neutral-350" />
          <p className="text-neutral-350 font-medium text-xs mt-1">No result for this search</p>
        </div>
      )}
      <div className="flex gap-3 justify-end">
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

import { type ApplicationGitRepository } from 'qovery-typescript-axios'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { LegacyAvatar, type LegacyAvatarProps } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useLastDeployedCommit } from '../hooks/use-last-deployed-commit/use-last-deployed-commit'

export interface LastCommitAuthorProps extends Omit<LegacyAvatarProps, 'firstName' | 'lastName' | 'url'> {
  gitRepository: ApplicationGitRepository
  serviceId: string
  serviceType: Extract<ServiceType, 'APPLICATION' | 'JOB' | 'CRON_JOB' | 'LIFECYCLE_JOB' | 'HELM'>
}

export function LastCommitAuthor({
  className,
  size,
  gitRepository,
  serviceId,
  serviceType,
  ...props
}: LastCommitAuthorProps) {
  const {
    data: { deployedCommit },
  } = useLastDeployedCommit({ gitRepository, serviceId, serviceType })

  return deployedCommit.author_name && deployedCommit.author_avatar_url ? (
    <LegacyAvatar
      size={size ?? 20}
      className={twMerge('border-2 border-neutral-200', className)}
      firstName={deployedCommit.author_name.split(' ')[0] || ''}
      lastName={deployedCommit.author_name.split(' ')[1] || ''}
      url={deployedCommit.author_avatar_url}
      {...props}
    />
  ) : (
    <LegacyAvatar
      size={size ?? 20}
      className={twMerge('border-2 border-neutral-200', className)}
      firstName={gitRepository.owner || ''}
      {...props}
    />
  )
}

export default LastCommitAuthor

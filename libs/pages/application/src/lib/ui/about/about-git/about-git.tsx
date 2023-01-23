import { ApplicationGitRepository } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { isApplication, isJob } from '@qovery/shared/enums'
import { ApplicationEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { Button, ButtonStyle, Icon, IconAwesomeEnum, Skeleton } from '@qovery/shared/ui'

export interface AboutGitProps {
  loadingStatus?: LoadingStatus
  application?: ApplicationEntity
}

export function AboutGit(props: AboutGitProps) {
  const { loadingStatus, application } = props
  const [gitRepository, setGitRepository] = useState<ApplicationGitRepository | undefined>(undefined)

  useEffect(() => {
    if (application) {
      if (isApplication(application)) setGitRepository(application.git_repository)
      else if (isJob(application)) {
        setGitRepository(application.source?.docker?.git_repository as ApplicationGitRepository)
      }
    }
  }, [application])

  return (
    <div className="p-8 flex flex-col items-start border-b border-element-light-lighter-400">
      <div className="font-bold mb-3 text-text-600">Source</div>

      <p>
        Commit: {gitRepository?.deployed_commit_contributor} {gitRepository?.owner}
      </p>

      <Skeleton height={24} width={70} show={!loadingStatus || loadingStatus === 'loading'} className="mb-5">
        <div className="flex gap-2 items-center px-2 h-6 capitalize border leading-0 rounded border-element-light-lighter-500 text-text-500 text-sm font-medium">
          <Icon name={application?.build_mode || ''} className="w-4" />
          {application?.build_mode && application?.build_mode.toLowerCase()}
        </div>
      </Skeleton>

      <Skeleton height={36} width={70} show={!loadingStatus || loadingStatus === 'loading'}>
        <Button
          link={gitRepository?.url || ''}
          style={ButtonStyle.STROKED}
          external={true}
          iconRight={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
          className="capitalize"
        >
          {gitRepository?.provider && gitRepository.provider.toLowerCase()}
        </Button>
      </Skeleton>
    </div>
  )
}

export default AboutGit

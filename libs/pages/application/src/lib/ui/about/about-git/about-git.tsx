import { type ApplicationGitRepository } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { IconEnum, isApplication, isJob } from '@qovery/shared/enums'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import { Button, ButtonStyle, Icon, IconAwesomeEnum, Truncate } from '@qovery/shared/ui'
import LastCommitFeature from '../../../feature/last-commit-feature/last-commit-feature'

export interface AboutGitProps {
  application?: ApplicationEntity
}

export function AboutGit(props: AboutGitProps) {
  const { application } = props
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
    <div className="p-8 flex flex-col items-start border-b border-neutral-200 text-neutral-400">
      <div className="font-bold mb-3 text-neutral-400">Source</div>

      <div className="mb-3 flex items-center gap-3">
        Commit: <LastCommitFeature />
      </div>
      <p className="mb-3 flex items-center gap-3">
        Branch:{' '}
        <strong className="font-medium">
          <Icon name={IconAwesomeEnum.CODE_BRANCH} className="mr-1 text-ssm" />
          {gitRepository?.branch}
        </strong>
      </p>

      <p className="flex items-center gap-3">
        Repository:{' '}
        <Button
          link={gitRepository?.url}
          iconLeft={gitRepository?.url && gitRepository.url.indexOf('github') >= 0 ? IconEnum.GITHUB : IconEnum.GITLAB}
          external
          style={ButtonStyle.STROKED}
        >
          <Truncate truncateLimit={18} text={gitRepository?.name || ''} />
        </Button>
      </p>
    </div>
  )
}

export default AboutGit

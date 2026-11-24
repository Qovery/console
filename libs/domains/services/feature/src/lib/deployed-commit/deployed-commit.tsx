import { type ApplicationGitRepository } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Button, CopyToClipboard, Icon, Tooltip } from '@qovery/shared/ui'

export interface DeployedCommitProps {
  gitRepository: Pick<ApplicationGitRepository, 'deployed_commit_id' | 'deployed_commit_date'>
}

export function DeployedCommit({ gitRepository }: DeployedCommitProps) {
  const [hover, setHover] = useState(false)
  const { deployed_commit_id: commitId, deployed_commit_date: commitDate } = gitRepository

  if (!commitId) {
    return null
  }

  return (
    <Tooltip content={commitDate ? `Commit at: ${commitDate}` : 'Deployed commit'}>
      <span>
        <CopyToClipboard text={commitId} className="flex min-w-[81px] justify-center">
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="xs"
            className="pl-1"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <Icon iconName={hover ? 'copy' : 'code-commit'} className="w-4" />
            {commitId.substring(0, 7)}
          </Button>
        </CopyToClipboard>
      </span>
    </Tooltip>
  )
}

export default DeployedCommit

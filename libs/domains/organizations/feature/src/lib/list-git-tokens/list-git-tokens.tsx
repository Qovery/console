import { useParams } from 'react-router-dom'
import { BlockContent } from '@qovery/shared/ui'
import useGitTokens from '../hooks/use-git-tokens/use-git-tokens'

export function ListGitTokens() {
  const { organizationId = '' } = useParams()
  const { data: gitTokens } = useGitTokens({ organizationId })

  return (
    <BlockContent title="Git tokens">
      <ul>
        {gitTokens?.map((gitToken) => (
          <li key={gitToken.id}>{gitToken.name}</li>
        ))}
      </ul>
    </BlockContent>
  )
}

export default ListGitTokens

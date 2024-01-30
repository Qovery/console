import { useParams } from 'react-router-dom'
import { useClusters } from '@qovery/domains/clusters/feature'
import { useProject } from '@qovery/domains/projects/feature'
import { type BaseLink } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { PageGeneral } from '../../ui/page-general/page-general'

export function PageGeneralFeature() {
  useDocumentTitle('Environments - Qovery')
  const { organizationId = '', projectId = '' } = useParams()

  const { data: clusters = [] } = useClusters({ organizationId })
  const { data: project } = useProject({ organizationId, projectId })

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment',
      linkLabel: 'How to manage my environment',
    },
  ]

  return (
    project && (
      <PageGeneral project={project} listHelpfulLinks={listHelpfulLinks} clusterAvailable={clusters.length > 0} />
    )
  )
}

export default PageGeneralFeature

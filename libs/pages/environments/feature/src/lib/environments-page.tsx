import { Container } from '@console/pages/environments/ui'
import { useDocumentTitle } from '@console/shared/utils'
import { useEnviroments } from '@console/domains/projects'

export function EnvironmentsPage() {
  useDocumentTitle('Environments - Qovery')
  const { environments } = useEnviroments()

  return <Container environments={environments} />
}

export default EnvironmentsPage

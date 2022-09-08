import { Navigate, Route, Routes } from 'react-router'
import { useParams } from 'react-router-dom'
import { SERVICES_APPLICATION_CREATION_URL, SERVICES_URL, SERVICE_CREATION_GENERAL_URL } from '@console/shared/router'
import { FunnelFlow } from '@console/shared/ui'
import { useDocumentTitle } from '@console/shared/utils'
import { ROUTER_SERVICE_CREATION } from '../../router/router'

export function PageApplicationCreateFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  // todo create context to store current step, current title and the result of each form from each step

  useDocumentTitle('Creation - Service')

  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`

  return (
    <FunnelFlow totalSteps={3} currentStep={1} currentTitle="wip">
      <Routes>
        {ROUTER_SERVICE_CREATION.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route path="*" element={<Navigate replace to={pathCreate + SERVICE_CREATION_GENERAL_URL} />} />
      </Routes>
    </FunnelFlow>
  )
}

export default PageApplicationCreateFeature

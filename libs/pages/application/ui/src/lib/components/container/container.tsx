import { Application, SignUp } from 'qovery-typescript-axios'
import { useNavigate } from 'react-router'
import { LayoutPage } from '@console/shared/ui'

export interface ContainerProps {
  authLogout: () => void
  user: SignUp
  application: Application
}

export function Container(props: ContainerProps) {
  const { authLogout, user, application } = props
  const navigate = useNavigate()

  return (
    <LayoutPage authLogout={authLogout} user={user}>
      <div>
        <button className="mb-2" onClick={() => navigate(-1)}>
          Back
        </button>
        <h1>{application.name}</h1>
      </div>
    </LayoutPage>
  )
}

export default Container

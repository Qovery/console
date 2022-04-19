import { SignUp } from 'qovery-typescript-axios'
import { useNavigate } from 'react-router'
import { LayoutPage } from '@console/shared/ui'

export interface ContainerProps {
  authLogout: () => void
  user: SignUp
}

export function Container(props: ContainerProps) {
  const { authLogout, user } = props
  const navigate = useNavigate()

  return (
    <LayoutPage authLogout={authLogout} user={user}>
      <div>
        <button className="mb-2" onClick={() => navigate(-1)}>
          Back
        </button>
        <h1>Welcome to Settings!</h1>
      </div>
    </LayoutPage>
  )
}

export default Container

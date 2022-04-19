import { LayoutPage } from '@console/shared/ui'
import { Application, SignUp } from 'qovery-typescript-axios'

export interface ContainerProps {
  authLogout: () => void
  user: SignUp
  application: Application
}

export function Container(props: ContainerProps) {
  const { authLogout, user, application } = props

  return (
    <LayoutPage authLogout={authLogout} user={user}>
      <div>
        <h1>{application.name}</h1>
      </div>
    </LayoutPage>
  )
}

export default Container

import { LayoutPage } from '@console/shared/ui'
import { SignUp } from 'qovery-typescript-axios'

export interface ContainerProps {
  authLogout: () => void
  user: SignUp
}

export function Container(props: ContainerProps) {
  const { authLogout, user } = props

  return (
    <LayoutPage authLogout={authLogout} user={user}>
      <h1>Welcome to Settings!</h1>
    </LayoutPage>
  )
}

export default Container

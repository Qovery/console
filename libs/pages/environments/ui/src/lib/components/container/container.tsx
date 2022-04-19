import { LayoutPage } from '@console/shared/ui'
import { APPLICATIONS_URL } from '@console/shared/utils'
import { Environment, SignUp } from 'qovery-typescript-axios'
import { Link } from 'react-router-dom'

export interface ContainerProps {
  authLogout: () => void
  user: SignUp
  environments: Environment[]
}

export function Container(props: ContainerProps) {
  const { authLogout, user, environments } = props

  return (
    <LayoutPage authLogout={authLogout} user={user}>
      <div>
        <h1>Welcome to Environments!</h1>
        <ul className="mt-8">
          {environments &&
            environments.map((environment: Environment) => (
              <li key={environment.id}>
                <Link className="link text-accent2-500" to={APPLICATIONS_URL(environment.id)}>
                  {environment.name}
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </LayoutPage>
  )
}

export default Container

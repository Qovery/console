import { LayoutPage } from '@console/shared/ui'
import { APPLICATION_URL } from '@console/shared/utils'
import { Application, SignUp } from 'qovery-typescript-axios'
import { Link } from 'react-router-dom'

export interface ContainerProps {
  authLogout: () => void
  user: SignUp
  applications: Application[]
}

export function Container(props: ContainerProps) {
  const { authLogout, user, applications } = props

  return (
    <LayoutPage authLogout={authLogout} user={user}>
      <div>
        <h1>Welcome to Applications!</h1>
        <ul className="mt-8">
          {applications &&
            applications.map((application: Application) => (
              <li key={application.id}>
                <Link className="link text-accent2-500" to={APPLICATION_URL(application.id)}>
                  {application.name}
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </LayoutPage>
  )
}

export default Container

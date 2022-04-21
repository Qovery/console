import { Environment } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { APPLICATIONS_URL } from '@console/shared/utils'

export interface ContainerProps {
  environments: Environment[]
}

export function Container(props: ContainerProps) {
  const { environments } = props
  const { organizationId, projectId } = useParams()
  const navigate = useNavigate()

  return (
    <div>
      <button className="mb-2" onClick={() => navigate(-1)}>
        Back
      </button>
      <h1>Welcome to Environments!</h1>
      <ul className="mt-8">
        {environments &&
          environments.map((environment: Environment) => (
            <li key={environment.id}>
              <Link className="link text-accent2-500" to={APPLICATIONS_URL(organizationId, projectId, environment.id)}>
                {environment.name}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default Container

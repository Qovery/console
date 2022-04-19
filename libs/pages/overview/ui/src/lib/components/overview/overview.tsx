import { SignUp } from 'qovery-typescript-axios'
import { LayoutPage } from '@console/shared/ui'
import { Project } from 'qovery-typescript-axios'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { ENVIRONMENTS_URL } from '@console/shared/utils'

export interface OverviewInterface {
  projects: Project[]
  authLogout: () => void
  user: SignUp
}

export function Overview(props: OverviewInterface) {
  const { projects, authLogout, user } = props
  const { organizationId } = useParams()

  return (
    <LayoutPage authLogout={authLogout} user={user}>
      <div>
        <h2 className="text-3xl font-extrabold text-brand-500">Overview</h2>
        <ul className="mt-8">
          {projects.map((project: Project) => (
            <li key={project.id}>
              <Link className="link text-accent2-500" to={ENVIRONMENTS_URL(organizationId, project.id)}>
                {project.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </LayoutPage>
  )
}

export default Overview

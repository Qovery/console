import { SignUp } from 'qovery-typescript-axios'
import { LayoutPage } from '@console/shared/ui'
import { Project } from 'qovery-typescript-axios'

interface OverviewInterface {
  projects: Project[]
  authLogout: () => void
  user: SignUp
}

export function Overview(props: OverviewInterface) {
  const { projects, authLogout, user } = props

  return (
    <LayoutPage authLogout={authLogout} user={user}>
      <div>
        <h2 className="text-3xl font-extrabold text-brand-500">Overview</h2>
        <ul className="mt-8">
          {projects.map((project: Project) => (
            <li key={project.id}>{project.name}</li>
          ))}
        </ul>
      </div>
    </LayoutPage>
  )
}

export default Overview

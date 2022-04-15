import { Organization, SignUp } from 'qovery-typescript-axios'
import { LayoutPage } from '@console/shared/ui'

interface IOverviewProps {
  organization: Organization[]
  authLogout: () => void
  user: SignUp
}

export function Overview(props: IOverviewProps) {
  const { organization, authLogout, user } = props

  console.log(user)

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

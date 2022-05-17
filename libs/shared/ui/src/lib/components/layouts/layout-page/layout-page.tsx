import { Application, Environment, Organization, Project, SignUp } from 'qovery-typescript-axios'
import Navigation from '../navigation/navigation'
import TopBar from '../top-bar/top-bar'

export interface LayoutPageProps {
  children: React.ReactElement
  authLogout: () => void
  user: SignUp
  organizations: Organization[]
  projects?: Project[]
  environments?: Environment[]
  applications?: Application[]
  application?: Application
}

export function LayoutPage(props: LayoutPageProps) {
  const { children, authLogout, user, organizations, projects, environments, applications } = props

  return (
    <main className="bg-element-light-lighter-400">
      <Navigation authLogout={authLogout} firstName={user?.first_name} lastName={user?.last_name} />
      <TopBar
        organizations={organizations}
        projects={projects}
        environments={environments}
        applications={applications}
      />
      <div className="p-2 mt-14 ml-14 h-full flex flex-col">{children}</div>
    </main>
  )
}

export default LayoutPage

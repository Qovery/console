import { Application, Database, Environment, Organization, Project, SignUp } from 'qovery-typescript-axios'
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
  databases?: Database[]
  darkMode?: boolean
}

export function LayoutPage(props: LayoutPageProps) {
  const { children, authLogout, user, organizations, projects, environments, applications, databases, darkMode } = props

  return (
    <main className={`${darkMode ? 'bg-element-light-darker-600' : 'bg-element-light-lighter-400'}`}>
      <Navigation darkMode={darkMode} authLogout={authLogout} firstName={user?.first_name} lastName={user?.last_name} />
      <TopBar
        organizations={organizations}
        projects={projects}
        environments={environments}
        applications={applications}
        databases={databases}
        darkMode={darkMode}
      />
      <div className="p-2 mt-16 ml-16 h-full flex flex-col">{children}</div>
    </main>
  )
}

export default LayoutPage

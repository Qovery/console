import { Project } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useParams } from 'react-router-dom'
import { fetchOrganization, selectAllOrganization } from '@qovery/domains/organization'
import { fetchProjects } from '@qovery/domains/projects'
import { ORGANIZATION_URL, OVERVIEW_URL } from '@qovery/shared/router'
import { LoadingScreen } from '@qovery/shared/ui'
import { AppDispatch } from '@qovery/store/data'

export function RedirectOverview() {
  const { organizationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const [noProject, setNoProject] = useState(false)
  const organizations = useSelector(selectAllOrganization)

  useEffect(() => {
    async function fetchCurrentOrganizationAndProjects() {
      if (organizations.length === 0) {
        await dispatch(fetchOrganization())
      }
      const projects: Project[] = await dispatch(fetchProjects({ organizationId })).unwrap()
      if (projects.length > 0) {
        window.location.href = OVERVIEW_URL(organizationId, projects[0].id)
      } else {
        setNoProject(true)
      }
    }
    fetchCurrentOrganizationAndProjects()
  }, [organizationId, dispatch, organizations])

  if (!noProject) {
    return <LoadingScreen />
  } else {
    return (
      <div className="fixed top-0 left-0 w-full h-full z-50 bg-brand-500 flex items-center justify-center text-element-light-darker-400">
        <div className="w-[400px] bg-white rounded p-6 shadow-xl">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <img className="w-[80px]" src="/assets/logos/logo-icon.svg" alt="Qovery logo" />
            </div>
            <p>
              You don't have project for this organization, please select another or create an organization with the{' '}
              <a
                className="text-accent2-500 inline-flex hover:underline py-1"
                href="https://console.qovery.com"
                target="_BLANK"
                rel="noreferrer"
              >
                Console V2
              </a>
              :
            </p>
          </div>
          <ul className="text-center">
            {organizations.map((organization) => (
              <li key={organization.id}>
                <NavLink
                  onClick={() => setNoProject(false)}
                  className="text-accent2-500 text-sm inline-flex flex-center gap-1 hover:underline py-1"
                  to={ORGANIZATION_URL(organization.id)}
                >
                  {organization.name}
                  {organization.id === organizationId && <span>(current organization)</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
}

export default RedirectOverview

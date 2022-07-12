import { useParams } from 'react-router-dom'
import { Navigate, Route, Routes } from 'react-router'
import { ENVIRONMENTS_URL, ENVIRONMENTS_SETTINGS_URL, ENVIRONMENTS_SETTINGS_GENERAL_URL } from '@console/shared/router'
import { NavigationLeft } from '@console/shared/ui'
import { useDocumentTitle } from '@console/shared/utils'
import { ROUTER_ENVIRONMENTS_SETTINGS } from '../../router/router'

export function PageSettingsFeature() {
  const { organizationId = '', projectId = '' } = useParams()

  useDocumentTitle('Environments - Settings')

  const pathSettings = `${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_SETTINGS_URL}`

  const links = [
    {
      title: 'General',
      icon: 'icon-solid-wheel',
      url: pathSettings + ENVIRONMENTS_SETTINGS_GENERAL_URL,
    },
    {
      title: 'Deployment',
      icon: 'icon-solid-wheel',
      subLinks: [
        {
          title: 'General',
        },
        {
          title: 'Restrictions',
        },
      ],
    },
    {
      title: 'Preview Environments',
      icon: 'icon-solid-wheel',
    },
    {
      title: 'Advanced settings',
      icon: 'icon-solid-wheel',
    },
    {
      title: 'Danger zone',
      icon: 'icon-solid-wheel',
    },
  ]

  return (
    <div className="bg-white flex mt-2 min-h-full">
      <div className="w-72 pt-6 border-r border-element-light-lighter-400">
        <NavigationLeft links={links} />
      </div>
      <Routes>
        {ROUTER_ENVIRONMENTS_SETTINGS.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route path="*" element={<Navigate replace to={pathSettings + ENVIRONMENTS_SETTINGS_GENERAL_URL} />} />
      </Routes>
    </div>
  )
}

export default PageSettingsFeature

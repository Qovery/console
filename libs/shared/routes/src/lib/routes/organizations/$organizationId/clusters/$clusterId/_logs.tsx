import { FileRoute, Outlet } from '@tanstack/react-router'
import { DarkModeEnabler, Layout } from '@qovery/pages/layout'

export const Route = new FileRoute('/organizations/$organizationId/clusters/$clusterId/_logs').createRoute({
  component: () => (
    <DarkModeEnabler isDarkMode>
      <Layout topBar>
        <Outlet />
      </Layout>
    </DarkModeEnabler>
  ),
})

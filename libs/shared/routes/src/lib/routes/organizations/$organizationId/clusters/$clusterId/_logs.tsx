import { Outlet, createFileRoute } from '@tanstack/react-router'
import { DarkModeEnabler, Layout } from '@qovery/pages/layout'

export const Route = createFileRoute('/organizations/$organizationId/clusters/$clusterId/_logs')({
  component: () => (
    <DarkModeEnabler isDarkMode>
      <Layout topBar>
        <Outlet />
      </Layout>
    </DarkModeEnabler>
  ),
})

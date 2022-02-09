import { OrganizationInterface } from '@console/domains/organizations'
import { LayoutPage } from '@console/shared-ui'

interface IOverviewProps {
  organizations: OrganizationInterface[]
}

export function Overview(props: IOverviewProps) {
  const { organizations } = props

  return (
    <LayoutPage>
      <div>
        <h2 className="text-3xl font-extrabold text-brand-500">Overview</h2>
        <ul className="mt-8">
          {organizations.map((organization: OrganizationInterface) => (
            <li key={organization.id}>{organization.name}</li>
          ))}
        </ul>
      </div>
    </LayoutPage>
  )
}

export default Overview

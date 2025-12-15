import { useParams, useRouter } from '@tanstack/react-router'
import { Avatar } from '@qovery/shared/ui'
import { Separator } from '../header'
import { BreadcrumbItem, type BreadcrumbItemData } from './breadcrumb-item'

export function Breadcrumbs() {
  const { buildLocation } = useRouter()
  const { orgId } = useParams({ strict: false })
  const ORGANIZATIONS: BreadcrumbItemData[] = [
    {
      id: 'acme',
      label: 'Acme Corp',
      path: buildLocation({ to: '/organization/$orgId', params: { orgId: 'acme' } }).href,
    },
    {
      id: 'techstart',
      label: 'TechStart Inc Long Label To Test The Truncation',
      path: buildLocation({ to: '/organization/$orgId', params: { orgId: 'techstart' } }).href,
    },
    {
      id: 'global',
      label: 'Global Systems LongLabelToTestTheTruncation',
      path: buildLocation({ to: '/organization/$orgId', params: { orgId: 'global' } }).href,
    },
    {
      id: 'innovation',
      label: 'Innovation Labs',
      path: buildLocation({ to: '/organization/$orgId', params: { orgId: 'innovation' } }).href,
    },
    {
      id: 'digital',
      label: 'Digital Solutions',
      path: buildLocation({ to: '/organization/$orgId', params: { orgId: 'digital' } }).href,
    },
  ]

  const currentOrg = ORGANIZATIONS.find((organization) => organization.id === orgId)

  if (!currentOrg) {
    return null
  }

  const breadcrumbData = [
    {
      item: {
        ...currentOrg,
        prefix: (
          <Avatar fallback={currentOrg.label.charAt(0).toUpperCase()} size="sm" border="solid" className="mr-0.5" />
        ),
      },
      items: ORGANIZATIONS,
    },
  ]

  return (
    <div className="flex items-center gap-2">
      {breadcrumbData.map((data, index) => (
        <div key={data.item.id} className="flex items-center gap-2">
          <BreadcrumbItem item={data.item} items={data.items} />
          {index < breadcrumbData.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  )
}

export default Breadcrumbs

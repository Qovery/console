import { Avatar } from '@qovery/shared/ui'
import { Separator } from '../header'
import { BreadcrumbItem, type BreadcrumbItemData } from './breadcrumb-item'

const ORGANIZATIONS: BreadcrumbItemData[] = [
  { id: 'org', label: 'Acme Corp', path: '/organizations/acme' },
  { id: '2', label: 'TechStart Inc Long Label To Test The Truncation', path: '/organizations/techstart' },
  { id: '3', label: 'Global Systems LongLabelToTestTheTruncation', path: '/organizations/global' },
  { id: '4', label: 'Innovation Labs', path: '/organizations/innovation' },
  { id: '5', label: 'Digital Solutions', path: '/organizations/digital' },
  { id: '6', label: 'Digital Solutions', path: '/organizations/digital' },
  { id: '7', label: 'Digital Solutions', path: '/organizations/digital' },
  { id: '8', label: 'Digital Solutions', path: '/organizations/digital' },
  { id: '9', label: 'Digital Solutions', path: '/organizations/digital' },
  { id: '10', label: 'Digital Solutions', path: '/organizations/digital' },
  { id: '11', label: 'Digital Solutions', path: '/organizations/digital' },
  { id: '12', label: 'Digital Solutions', path: '/organizations/digital' },
  { id: '13', label: 'Digital Solutions', path: '/organizations/digital' },
  { id: '14', label: 'Digital Solutions', path: '/organizations/digital' },
  { id: '15', label: 'Digital Solutions', path: '/organizations/digital' },
  { id: '16', label: 'Digital Solutions', path: '/organizations/digital' },
  { id: '17', label: 'Digital Solutions', path: '/organizations/digital' },
]

export function Breadcrumbs() {
  const breadcrumbData = [
    {
      item: {
        id: 'org',
        label: 'Acme Corp',
        path: '/organizations/acme',
        prefix: <Avatar fallback="AC" size="sm" border="solid" className="mr-0.5" />,
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

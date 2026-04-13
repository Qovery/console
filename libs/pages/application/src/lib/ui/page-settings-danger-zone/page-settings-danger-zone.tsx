import { BlockContentDelete } from '@qovery/shared/ui'

export interface PageSettingsDangerZoneProps {
  deleteService: () => void
  serviceName?: string
}

export function PageSettingsDangerZone(props: PageSettingsDangerZoneProps) {
  const { deleteService, serviceName } = props
  return (
    <div className="flex w-full flex-col justify-between">
      <div className="max-w-content-with-navigation-left p-8">
        <BlockContentDelete
          title="Delete service"
          ctaLabel="Delete service"
          callback={deleteService}
          modalConfirmation={{
            title: 'Delete service',
            name: serviceName,
          }}
        />
      </div>
    </div>
  )
}

export default PageSettingsDangerZone

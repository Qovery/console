import { BlockContentDelete } from '@qovery/shared/ui'

export interface PageSettingsDangerZoneProps {
  deleteCluster: () => void
}

export function PageSettingsDangerZone(props: PageSettingsDangerZoneProps) {
  const { deleteCluster } = props
  return (
    <div className="flex w-full flex-col justify-between">
      <div className="max-w-content-with-navigation-left p-8">
        <BlockContentDelete
          title="Uninstall cluster"
          ctaLabel="Delete cluster"
          customModalConfirmation={deleteCluster}
        />
      </div>
    </div>
  )
}

export default PageSettingsDangerZone

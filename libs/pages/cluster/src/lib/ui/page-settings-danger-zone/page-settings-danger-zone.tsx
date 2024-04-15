import { BlockContentDelete } from '@qovery/shared/ui'

export interface PageSettingsDangerZoneProps {
  deleteCluster: () => void
}

export function PageSettingsDangerZone(props: PageSettingsDangerZoneProps) {
  const { deleteCluster } = props
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
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

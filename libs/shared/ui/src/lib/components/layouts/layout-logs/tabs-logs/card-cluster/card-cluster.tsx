import { Icon, StatusChip, Tooltip } from '@console/shared/ui'
import { CloudProviderEnum, StateEnum } from 'qovery-typescript-axios'

export interface CardClusterProps {
  name: string
  cloud_provider: CloudProviderEnum
  region: string
  id: string
  organizationId: string
  status?: StateEnum
  version?: string
}

export const splitId = (id: string) => `${id.split('-')[0]}[...]${id.split('-')[id.split('-').length - 1]}`

export function CardCluster(props: CardClusterProps) {
  const { name, cloud_provider, region, id, organizationId, version, status } = props

  const copyToClipboard = (string: string) => {
    navigator.clipboard.writeText(string)
  }

  return (
    <div className="bg-element-light-darker-300 p-4 rounded">
      <div data-testid="status" className="flex items-center text-text-300 font-bold text-xs">
        <StatusChip status={status} className="mr-4" /> Cluster infra logs
      </div>
      <div className="mt-4">
        <div className="flex mt-1">
          <Icon data-testid="icon" name={`${cloud_provider}_GRAY`} className="mr-4 mt-[2px]" />
          <div>
            <p className="text-text-200 text-sm font-medium">
              {name} ({region})
            </p>
            <ul className="text-xs mt-5">
              <li className="flex mb-2">
                <span className="text-text-300 w-16 mr-3">Cluster ID</span>
                <div className="flex">
                  <span className="text-accent2-400">{splitId(id)}</span>
                  <Tooltip content="Copy">
                    <div className="cursor-pointer ml-1" onClick={() => copyToClipboard(id)}>
                      <Icon name="icon-solid-copy" className="text-text-300" />
                    </div>
                  </Tooltip>
                </div>
              </li>
              <li className="flex mb-2">
                <span className="text-text-300 w-16 mr-3">Version</span>
                <span className="text-text-300">{version}</span>
              </li>
              <li className="flex">
                <span className="text-text-300 w-16 mr-3">Org. ID</span>
                <div className="flex">
                  <span className="text-accent2-400">{splitId(organizationId)}</span>
                  <Tooltip content="Copy">
                    <div className="cursor-pointer ml-1" onClick={() => copyToClipboard(organizationId)}>
                      <Icon name="icon-solid-copy" className="text-text-300" />
                    </div>
                  </Tooltip>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardCluster

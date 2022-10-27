import { useParams } from 'react-router-dom'
import { Button } from '@qovery/shared/ui'

/* eslint-disable-next-line */
export interface PageSettingsProps {}

export function PageSettings(props: PageSettingsProps) {
  const { organizationId, projectId, environmentId } = useParams()

  return (
    <div className="bg-white flex-grow mt-2 flex justify-center items-center flex-col gap-3 rounded-b-sm">
      <h2 className="text-text-500 text-base font-medium">
        This feature is not available yet. Please continue your action on the V2
      </h2>
      <Button
        external
        link={`https://console.qovery.com/platform/organization/${organizationId}/projects/${projectId}/environments/${environmentId}/applications`}
      >
        Go to V2
      </Button>
    </div>
  )
}

export default PageSettings

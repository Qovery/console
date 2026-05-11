import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  AnnotationSetting,
  ContainerRegistryCreateEditModal,
  GitRepositorySettings,
  LabelSetting,
} from '@qovery/domains/organizations/feature'
import {
  ApplicationContainerStepGeneral,
  EntrypointCmdInputs,
  GeneralContainerSettings,
} from '@qovery/domains/services/feature'
import { type ApplicationGeneralData } from '@qovery/shared/interfaces'
import { serviceCreateParamsSchema } from '@qovery/shared/router'
import { useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/$slug/general'
)({
  component: General,
  validateSearch: serviceCreateParamsSchema,
})

function General() {
  const { organizationId = '', projectId = '', environmentId = '', slug } = Route.useParams()
  const navigate = useNavigate()
  const search = Route.useSearch()

  const { openModal, closeModal } = useModal()

  const openContainerRegistryCreateEditModal = () => {
    return openModal({
      content: <ContainerRegistryCreateEditModal organizationId={organizationId} onClose={closeModal} />,
      options: {
        fakeModal: true,
        width: 680,
      },
    })
  }

  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/${slug}`

  useDocumentTitle('General - Create Service')

  const handleSubmit = (_data: ApplicationGeneralData) => {
    navigate({ to: `${creationFlowUrl}/resources`, search })
  }

  return (
    <ApplicationContainerStepGeneral
      onSubmit={handleSubmit}
      gitRepositorySettings={<GitRepositorySettings organizationId={organizationId} gitDisabled={false} />}
      generalContainerSettings={
        <GeneralContainerSettings
          organizationId={organizationId}
          openContainerRegistryCreateEditModal={openContainerRegistryCreateEditModal}
        />
      }
      entrypointCmdInputs={<EntrypointCmdInputs />}
      labelSetting={<LabelSetting />}
      annotationSetting={<AnnotationSetting />}
    />
  )
}

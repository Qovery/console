import { type HelmRequestAllOfSource } from 'qovery-typescript-axios'
import { useParams } from 'react-router'
import { BlockContent, Button, CodeEditor, Icon, useModal } from '@qovery/shared/ui'
import ValuesOverrideYamlModal from '../values-override-yaml-modal/values-override-yaml-modal'

export interface ValuesOverrideYamlSettingProps {
  source: HelmRequestAllOfSource
  onSubmit: (value?: string) => void
  content?: string
  environmentId?: string
  projectId?: string
  serviceId?: string
}

export function ValuesOverrideYamlSetting({
  onSubmit,
  content,
  source,
  environmentId: envIdProp,
  projectId: projectIdProp,
  serviceId: serviceIdProp,
}: ValuesOverrideYamlSettingProps) {
  const { openModal, closeModal } = useModal()
  const {
    environmentId: envIdParam = '',
    projectId: projectIdParam = '',
    serviceId: serviceIdParam = '',
    applicationId = '',
  } = useParams()

  // Use props if provided, otherwise fall back to useParams
  const environmentId = envIdProp || envIdParam
  const projectId = projectIdProp || projectIdParam
  const serviceId = serviceIdProp || serviceIdParam || applicationId

  const openModalValuesOverrideYaml = () => {
    openModal({
      content: (
        <ValuesOverrideYamlModal
          content={content}
          environmentId={environmentId}
          projectId={projectId}
          serviceId={serviceId}
          source={source}
          onClose={closeModal}
          onSubmit={onSubmit}
        />
      ),
      options: {
        fullScreen: true,
      },
    })
  }

  return (
    <BlockContent
      title="Raw YAML"
      classNameContent="p-0"
      headRight={
        content && (
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={openModalValuesOverrideYaml}
            className="hover:text-neutral-400"
          >
            <Icon iconName="pen" />
          </Button>
        )
      }
    >
      {content ? (
        <CodeEditor value={content} readOnly height="300px" language="yaml" />
      ) : (
        <div className="my-4 px-10 py-5 text-center">
          <Icon iconName="wave-pulse" className="text-neutral-350" />
          <p className="mb-3 mt-1 text-xs font-medium text-neutral-350">No override defined.</p>
          <Button type="button" size="md" onClick={openModalValuesOverrideYaml}>
            Create override <Icon iconName="pen" className="ml-2" />
          </Button>
        </div>
      )}
    </BlockContent>
  )
}

export default ValuesOverrideYamlSetting

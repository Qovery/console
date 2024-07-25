import { APIVariableScopeEnum, type JobLifecycleTypeEnum } from 'qovery-typescript-axios'
import { type ReactNode, useEffect, useState } from 'react'
import { useLifecycleTemplate } from '@qovery/domains/environments/feature'
import { type ServiceTemplateOptionType } from '../page-new-feature/service-templates'
import { useJobContainerCreateContext } from './page-job-create-feature'

function getLifecycleType(option?: string): JobLifecycleTypeEnum {
  if (option?.includes('terraform')) {
    return 'TERRAFORM'
  }

  if (option?.includes('cloudformation')) {
    return 'CLOUDFORMATION'
  }

  return 'GENERIC'
}

interface TemplateFormContextSyncProps {
  environmentId: string
  templateData: ServiceTemplateOptionType & { template_id: string }
  children: ReactNode
}

export function TemplateFormContextSync({
  environmentId,
  templateData: { slug, template_id: templateId },
  children,
}: TemplateFormContextSyncProps) {
  const { data: template } = useLifecycleTemplate({ environmentId, templateId })
  const {
    setGeneralData,
    setConfigureData,
    setVariableData,
    setResourcesData,
    dockerfileForm,
    setTemplateType,
    setDockerfileDefaultContent,
  } = useJobContainerCreateContext()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (template) {
      setTemplateType(getLifecycleType(slug))

      // General
      setGeneralData((generalData) => ({
        ...(generalData ?? {}),
        auto_deploy: true,
        description: '',
        name: slug,
        serviceType: slug === 'container' ? 'CONTAINER' : 'APPLICATION',
      }))

      // Configure / Dockerfile
      dockerfileForm.setValue('dockerfile_source', 'DOCKERFILE_RAW')
      dockerfileForm.setValue('dockerfile_raw', template.dockerfile)
      setDockerfileDefaultContent(template.dockerfile)

      // Resources
      setResourcesData((resourcesData) => ({
        ...(resourcesData ?? {}),
        cpu: template.resources.cpu_milli,
        memory: template.resources.ram_mib,
      }))

      // Job config
      const startEvent = template.events.find(({ name }) => name === 'start')
      const stopEvent = template.events.find(({ name }) => name === 'stop')
      const deleteEvent = template.events.find(({ name }) => name === 'delete')

      setConfigureData((configureData) => ({
        ...(configureData ?? {}),
        max_duration: template.max_duration_in_minutes,
        on_start: startEvent
          ? {
              enabled: true,
              entrypoint: startEvent.entrypoint,
              arguments: startEvent.command,
              arguments_string: startEvent.command.join(' '),
            }
          : { enabled: false },
        on_stop: stopEvent
          ? {
              enabled: true,
              entrypoint: stopEvent.entrypoint,
              arguments: stopEvent.command,
              arguments_string: stopEvent.command.join(' '),
            }
          : { enabled: false },
        on_delete: deleteEvent
          ? {
              enabled: true,
              entrypoint: deleteEvent.entrypoint,
              arguments: deleteEvent.command,
              arguments_string: deleteEvent.command.join(' '),
            }
          : { enabled: false },
      }))

      // Variables

      setVariableData((variableData) => ({
        ...(variableData ?? {}),
        variables: template.variables.map((v) => ({
          variable: v.name,
          isSecret: v.is_secret,
          isReadOnly: true,
          file: v.file,
          scope: APIVariableScopeEnum.JOB,
          value: v.file ? v.default : '',
          description: v.description,
        })),
      }))

      setShouldRender(true)
    }
  }, [template])

  return shouldRender ? children : null
}

export default TemplateFormContextSync

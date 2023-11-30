import { type HelmRequestAllOfSource } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { BlockContent, Button, CodeEditor } from '@qovery/shared/ui'
import useCreateHelmDefaultValues from '../hooks/use-create-helm-default-values/use-create-helm-default-values'

// import useCreateHelmDefaultValues from '../hooks/use-create-helm-default-values/use-create-helm-default-values'

export interface ValuesOverrideYamlModalProps {
  environmentId: string
  source: HelmRequestAllOfSource
  onClose: () => void
}

export function ValuesOverrideYamlModal({ source, environmentId, onClose }: ValuesOverrideYamlModalProps) {
  const { mutateAsync: createHelmDefaultValues } = useCreateHelmDefaultValues()
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchHelmDefaultValues() {
      try {
        const response = await createHelmDefaultValues({
          environmentId,
          helmDefaultValuesRequest: {
            source,
          },
        })
        setValue(response)
      } catch (error) {
        setError(true)
      }
    }

    fetchHelmDefaultValues()
  }, [environmentId, source, createHelmDefaultValues])

  return (
    <div className="p-6 h-full">
      <h2 className="h4 text-neutral-400">Raw YAML</h2>
      <div className="flex h-full">
        <BlockContent title="Raw YAML" classNameContent="p-0">
          <CodeEditor width="100%" height="100vh" />
        </BlockContent>
        <BlockContent title="Raw YAML" classNameContent="p-0">
          {error ? (
            <p>Default values not available</p>
          ) : (
            <CodeEditor width="100%" height="100vh" defaultValue={value} />
          )}
        </BlockContent>
      </div>
      <div className="flex gap-3 justify-end mt-6">
        <Button>Save</Button>
      </div>
    </div>
  )
}

export default ValuesOverrideYamlModal

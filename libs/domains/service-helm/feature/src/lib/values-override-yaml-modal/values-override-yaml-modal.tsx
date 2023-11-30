import { Button, CodeEditor } from '@qovery/shared/ui'

export interface ValuesOverrideYamlModalProps {
  onClose: () => void
}

export function ValuesOverrideYamlModal({ onClose }: ValuesOverrideYamlModalProps) {
  return (
    <div className="p-6">
      <h2 className="h4 text-neutral-400">Raw YAML</h2>
      <CodeEditor />
      <div className="flex gap-3 justify-end mt-6">
        <Button>Save</Button>
      </div>
    </div>
  )
}

export default ValuesOverrideYamlModal

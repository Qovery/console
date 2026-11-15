import { type SkillPresetAssignees } from '@qovery/domains/skill-presets/data-access'
import { InputSelect } from '@qovery/shared/ui'
import { PREVIEW_ANYONE, previewTargets } from '../utils/preview-target'

export interface PreviewAsMemberSelectProps {
  value: string
  onChange: (value: string) => void
  assignees?: SkillPresetAssignees
  anyoneLabel?: string
}

export function PreviewAsMemberSelect({ value, onChange, assignees, anyoneLabel }: PreviewAsMemberSelectProps) {
  const options = [
    ...(anyoneLabel ? [{ value: PREVIEW_ANYONE, label: anyoneLabel }] : []),
    ...previewTargets(assignees),
  ]
  return (
    <InputSelect
      label="Preview as"
      isSearchable
      options={options}
      value={value}
      onChange={(next) => onChange(next as string)}
    />
  )
}

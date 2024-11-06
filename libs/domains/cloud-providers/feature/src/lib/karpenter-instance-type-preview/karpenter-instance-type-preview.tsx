import { type CpuArchitectureEnum, type KarpenterNodePoolRequirement } from 'qovery-typescript-axios'
import { twMerge } from 'tailwind-merge'
import { pluralize } from '@qovery/shared/util-js'

export interface KarpenterInstanceTypePreview {
  defaultServiceArchitecture: CpuArchitectureEnum
  requirements?: KarpenterNodePoolRequirement[]
  className?: string
}

function TruncatedList({ values, maxDisplay = 10 }: { values: string[]; maxDisplay?: number }) {
  if (values.length <= maxDisplay) {
    return <>{values.join(', ')}</>
  }

  const displayedValues = values.slice(0, maxDisplay)
  const remaining = values.length - maxDisplay

  return (
    <>
      {displayedValues.join(', ')} and {remaining} {pluralize(remaining, 'other', 'others')}
    </>
  )
}

export function KarpenterInstanceTypePreview({
  defaultServiceArchitecture,
  requirements,
  className,
}: KarpenterInstanceTypePreview) {
  const architectures = requirements?.find((a) => a.key === 'Arch')
  const sizes = requirements?.find((s) => s.key === 'InstanceSize')
  const families = requirements?.find((f) => f.key === 'InstanceFamily')

  return (
    <div className={twMerge('flex flex-col gap-1 text-sm text-neutral-400', className)}>
      {architectures && architectures?.values.length > 0 && (
        <p className="font-normal">
          <span className="font-medium">
            {pluralize(architectures?.values.length, 'Architecture', 'Architectures')}:{' '}
          </span>
          {architectures?.values.join(', ')}
        </p>
      )}
      <p className="font-normal">
        <span className="font-medium">Default build architecture: </span>
        {defaultServiceArchitecture}
      </p>
      {families && families?.values.length > 0 && (
        <p className="font-normal">
          <span className="font-medium">{pluralize(families?.values.length, 'Family', 'Families')}: </span>
          <TruncatedList values={families?.values} />
        </p>
      )}
      {sizes && sizes?.values.length > 0 && (
        <p className="font-normal">
          <span className="font-medium">{pluralize(sizes?.values.length, 'Size', 'Sizes')}: </span>
          <TruncatedList values={sizes?.values} maxDisplay={8} />
        </p>
      )}
    </div>
  )
}

export default KarpenterInstanceTypePreview

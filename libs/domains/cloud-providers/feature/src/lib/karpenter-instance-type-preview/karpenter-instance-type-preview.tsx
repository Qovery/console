import { type CpuArchitectureEnum, type KarpenterNodePoolRequirement } from 'qovery-typescript-axios'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import sortInstanceSizes from '../karpenter-instance-filter-modal/utils/sort-instance-sizes'

export interface KarpenterInstanceTypePreviewProps {
  defaultServiceArchitecture: CpuArchitectureEnum
  requirements?: KarpenterNodePoolRequirement[]
  className?: string
}

function TruncatedList({ values, maxDisplay = 10 }: { values: string[]; maxDisplay?: number }) {
  const uniqueValues = Array.from(new Set(values))
  if (uniqueValues.length <= maxDisplay) return <>{uniqueValues.join(', ')}</>

  const displayedValues = uniqueValues.slice(0, maxDisplay)
  const remaining = uniqueValues.length - maxDisplay

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
}: KarpenterInstanceTypePreviewProps) {
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
          {architectures?.values.join(', ').toUpperCase()}
        </p>
      )}
      <p className="font-normal">
        <span className="font-medium">Default build architecture: </span>
        {defaultServiceArchitecture}
      </p>
      {families && families?.values.length > 0 && (
        <p className="font-normal">
          <span className="font-medium">{pluralize(families?.values.length, 'Family', 'Families')}: </span>
          <TruncatedList values={families?.values.sort((a, b) => a.localeCompare(b))} />
        </p>
      )}
      {sizes && sizes?.values.length > 0 && (
        <p className="font-normal">
          <span className="font-medium">{pluralize(sizes?.values.length, 'Size', 'Sizes')}: </span>
          <TruncatedList values={sortInstanceSizes(sizes?.values)} maxDisplay={8} />
        </p>
      )}
    </div>
  )
}

export default KarpenterInstanceTypePreview

import { Button, Icon, Slider } from '@qovery/shared/ui'
import useCostDemoControls from '../hooks/use-cost-demo-controls/use-cost-demo-controls'

export interface CostDemoControlsProps {
  projectId: string
  /** Current forecast as a percentage of the budget. */
  currentPercent: number
}

/**
 * PROTOTYPE-ONLY. Moves the project to any point in its budget so a scenario can
 * be replayed live — reaching the 100% threshold otherwise means actually
 * spending the money.
 */
export function CostDemoControls({ projectId, currentPercent }: CostDemoControlsProps) {
  const { setConsumption, reset } = useCostDemoControls(projectId)

  return (
    <details className="mt-8 rounded border border-dashed border-neutral p-4">
      <summary className="cursor-pointer text-xs text-neutral-subtle">
        <Icon iconName="flask" iconStyle="regular" className="mr-1.5" />
        Demo controls
      </summary>
      <div className="mt-4 flex items-end gap-4">
        <Slider
          className="max-w-sm"
          label="Forecast, as a share of budget"
          valueLabel="%"
          min={0}
          max={150}
          step={5}
          value={[Math.round(currentPercent)]}
          onChange={([value]) => setConsumption(value)}
        />
        <Button type="button" variant="outline" color="neutral" onClick={reset}>
          Reset
        </Button>
      </div>
    </details>
  )
}

export default CostDemoControls

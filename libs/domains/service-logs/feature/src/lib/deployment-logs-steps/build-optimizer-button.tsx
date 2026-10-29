import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Icon, Tooltip, useModal } from '@qovery/shared/ui'
import { SAMPLE_BUILD_OPTIMIZATION_ANALYSIS } from './build-optimization-analysis'
import { BuildOptimizationModal } from './build-optimization-modal'

// TODO: run the analysis through the API once it exists. Until then, this delay stands for it.
export const SAMPLE_ANALYSIS_DURATION_MS = 2000

type AnalysisState = 'NOT_STARTED' | 'ANALYZING' | 'DONE'

export interface BuildOptimizerButtonProps {
  // The build is analyzed once it went through
  isBuildSucceeded: boolean
}

export function BuildOptimizerButton({ isBuildSucceeded }: BuildOptimizerButtonProps) {
  const { openModal, closeModal } = useModal()
  const [analysisState, setAnalysisState] = useState<AnalysisState>('NOT_STARTED')
  const analysisTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(analysisTimeoutRef.current), [])

  const openAnalysis = useCallback(
    () =>
      openModal({
        content: <BuildOptimizationModal analysis={SAMPLE_BUILD_OPTIMIZATION_ANALYSIS} onClose={closeModal} />,
        options: { width: 676 },
      }),
    [openModal, closeModal]
  )

  if (!isBuildSucceeded) {
    return (
      <Tooltip content="Available once the build succeeded">
        <span>
          <Button variant="outline" color="neutral" size="xs" disabled>
            <Icon iconName="bolt" iconStyle="regular" />
            Optimize
          </Button>
        </span>
      </Tooltip>
    )
  }

  if (analysisState === 'ANALYZING') {
    return (
      <Button variant="outline" color="neutral" size="xs" className="pointer-events-none" aria-disabled="true">
        <Icon iconName="spinner" iconStyle="regular" className="animate-spin" />
        Analyzing
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      color="neutral"
      size="xs"
      onClick={() => {
        if (analysisState === 'DONE') {
          openAnalysis()
          return
        }
        setAnalysisState('ANALYZING')
        analysisTimeoutRef.current = setTimeout(() => {
          setAnalysisState('DONE')
          openAnalysis()
        }, SAMPLE_ANALYSIS_DURATION_MS)
      }}
    >
      <Icon iconName="bolt" iconStyle="regular" />
      {analysisState === 'DONE' ? 'Open analysis' : 'Optimize'}
    </Button>
  )
}

export default BuildOptimizerButton

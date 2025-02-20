import { type EnvironmentStatus, type Status } from 'qovery-typescript-axios'
import { memo, useState } from 'react'
import { AIAnalysisModal, type AIAnalysisResult } from './ai-analysis-modal'

export interface AIAnalysisButtonProps {
  onClick: () => void
  serviceStatus?: Status | null
  environmentStatus?: EnvironmentStatus | undefined
  environmentId: string
}

export const AIAnalysisButton = memo(({ serviceStatus }: AIAnalysisButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result] = useState<AIAnalysisResult>()

  const hasError =
    serviceStatus?.state === 'DEPLOYMENT_ERROR' ||
    serviceStatus?.steps?.details?.some((step) => step.status === 'ERROR') ||
    serviceStatus?.status_details?.status === 'ERROR'

  if (!hasError) return null

  const handleAnalysis = async () => {
    setIsModalOpen(true)
    setLoading(true)
  }

  return (
    <>
      <button
        onClick={handleAnalysis}
        className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 transform animate-pulse cursor-pointer items-center gap-2 rounded-full bg-[#5B50D6] px-6 py-3 text-white shadow-lg transition-all hover:scale-105 hover:bg-[#6E64D9]"
        aria-label="Analyze with AI"
      >
        <div className="relative flex items-center gap-2">
          {/* Kirby container */}
          <div className="relative h-8 w-8">
            {/* Kirby face */}
            <div className="absolute h-full w-full rounded-full border-[2px] border-[#FF69B4] bg-[#FFB7C5]">
              <div className="absolute left-1/2 top-[35%] flex -translate-x-1/2 space-x-1.5">
                <div className="relative h-2 w-1 overflow-hidden rounded-[100%] bg-black">
                  <div className="absolute bottom-0 h-[35%] w-full bg-[#0066FF]" />
                  <div className="absolute top-0 h-[35%] w-full bg-white" />
                </div>
                <div className="relative h-2 w-1 overflow-hidden rounded-[100%] bg-black">
                  <div className="absolute bottom-0 h-[35%] w-full bg-[#0066FF]" />
                  <div className="absolute top-0 h-[35%] w-full bg-white" />
                </div>
              </div>

              <div className="absolute left-1 top-[60%] h-1.5 w-1.5 rounded-full bg-[#FF9ECD]" />
              <div className="absolute right-1 top-[60%] h-1.5 w-1.5 rounded-full bg-[#FF9ECD]" />

              <div className="absolute left-1/2 top-[65%] h-1 w-1.5 -translate-x-1/2 rounded-full bg-[#FF6B8B]" />
            </div>
          </div>

          {/* Text content */}
          <div className="flex flex-col items-start">
            <span className="font-semibold">Kirbynetes, save my deploy! 🚑</span>
            <span className="text-[10px] text-neutral-200">powered by AI</span>
          </div>
        </div>

        <div className="absolute -left-1 -top-1 animate-spin">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFD700">
            <path d="M12 0L14.645 9.355L24 12L14.645 14.645L12 24L9.355 14.645L0 12L9.355 9.355L12 0Z" />
          </svg>
        </div>
        <div className="absolute -bottom-1 -right-1 animate-spin">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFD700">
            <path d="M12 0L14.645 9.355L24 12L14.645 14.645L12 24L9.355 14.645L0 12L9.355 9.355L12 0Z" />
          </svg>
        </div>
      </button>

      <AIAnalysisModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} loading={loading} result={result} />
    </>
  )
})

AIAnalysisButton.displayName = 'AIAnalysisButton'

export default AIAnalysisButton

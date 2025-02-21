import axios from 'axios'
import { type ReactNode, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@qovery/shared/ui'

export interface AIAnalysisResult {
  error: string
  cause: string
  solution: string
}

interface AIAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  loading: boolean
  result?: AIAnalysisResult
  children?: ReactNode
}

const aiAnalysisAxios = axios.create({
  baseURL: 'https://p8080-za2cda663-z3d1a50f1-gtw.zc531a994.rustrocks.cloud',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

// Composant pour parser et afficher du texte avec des liens markdown
const MarkdownText = ({ text }: { text: string }) => {
  if (!text) return null

  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = markdownLinkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 underline hover:text-blue-300"
      >
        {match[1]}
      </a>
    )

    lastIndex = markdownLinkRegex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return <>{parts}</>
}

const SolutionFeedback = () => {
  const [rating, setRating] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="mt-4 border-t border-neutral-700 pt-4">
        <p className="text-sm text-white">Thanks for your feedback!</p>
      </div>
    )
  }

  return (
    <div className="mt-4 border-t border-neutral-700 pt-4">
      <p className="text-sm text-white">Was this solution helpful?</p>
      <div className="mt-2 flex items-center gap-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => {
                setRating(star)
                // Ici vous pourriez ajouter une fonction pour envoyer le feedback à votre backend
                setTimeout(() => setSubmitted(true), 500)
              }}
              className={`text-xl transition-colors ${
                rating && star <= rating ? 'text-yellow-400' : 'text-neutral-600 hover:text-yellow-400'
              }`}
            >
              ★
            </button>
          ))}
        </div>
        {rating && !submitted && (
          <span className="text-sm text-white">
            {rating <= 2 ? 'Sorry to hear that' : rating === 3 ? 'Thanks!' : 'Glad it helped!'}
          </span>
        )}
      </div>
    </div>
  )
}

const ResultSection = ({
  title,
  content,
  isError = false,
  showFeedback = false,
}: {
  title: string
  content: string
  isError?: boolean
  showFeedback?: boolean
}) => {
  const [showCopied, setShowCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <div className={`rounded-lg p-4 ${isError ? 'bg-red-900/20' : 'bg-[#232A3B]'}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`text-lg font-medium ${isError ? 'text-red-400' : 'text-[#5B50D6]'}`}>{title}</h3>
        <button
          onClick={handleCopy}
          className="p-1 text-white transition-colors hover:text-neutral-200"
          title="Copy to clipboard"
        >
          {showCopied ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
          )}
        </button>
      </div>
      <div className="text-white">
        <MarkdownText text={content} />
      </div>
      {showFeedback && <SolutionFeedback />}
    </div>
  )
}

export function AIAnalysisModal({
  isOpen,
  onClose,
  loading: initialLoading,
  result: initialResult,
}: AIAnalysisModalProps) {
  const [loading, setLoading] = useState(initialLoading)
  const [result, setResult] = useState<AIAnalysisResult | undefined>(initialResult)
  const navigate = useNavigate()

  const extractEnvironmentId = () => {
    const currentUrl = window.location.pathname
    const matches = currentUrl.match(/environment\/([^/]+)\/logs/)
    return matches ? matches[1] : null
  }

  const fetchAIAnalysis = async () => {
    const environmentId = extractEnvironmentId()

    if (!environmentId) {
      console.error('No environment ID found')
      return
    }

    setLoading(true)
    setResult(undefined)

    try {
      const response = await aiAnalysisAxios.get(`/env/${environmentId}`)

      let parsedData
      if (typeof response.data === 'string') {
        try {
          const cleanedJsonString = response.data.replace(/`/g, "'").replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
          parsedData = JSON.parse(cleanedJsonString)
        } catch (parseError) {
          console.error('JSON Parsing error:', parseError)
          setResult({
            error: 'Failed to parse AI response',
            cause: 'Invalid JSON format',
            solution: 'Check server response format',
          })
          return
        }
      } else {
        parsedData = response.data
      }

      setResult({
        error: parsedData.error || 'No error details found',
        cause: parsedData.cause || 'No root cause identified',
        solution: parsedData.solution || 'No solution provided',
      })
    } catch (error: unknown) {
      console.error('Fetch error:', error)
      setResult({
        error: 'Failed to fetch AI analysis',
        cause: 'Network or service error',
        solution: 'Check your local service and network connection',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditService = () => {
    const currentUrl = window.location.pathname
    const matches = currentUrl.match(/organization\/([^/]+)\/project\/([^/]+)\/environment\/([^/]+)\/logs\/([^/]+)/)

    if (matches) {
      const [, organizationId, projectId, environmentId, serviceId] = matches
      const settingsPath = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/application/${serviceId}/settings/general`
      navigate(settingsPath)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchAIAnalysis()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-[35%] top-[20%] animate-pulse">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFD700">
          <path d="M12 0L14.645 9.355L24 12L14.645 14.645L12 24L9.355 14.645L0 12L9.355 9.355L12 0Z" />
        </svg>
      </div>
      <div className="absolute right-[35%] top-[25%] animate-ping delay-150">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700">
          <path d="M12 0L14.645 9.355L24 12L14.645 14.645L12 24L9.355 14.645L0 12L9.355 9.355L12 0Z" />
        </svg>
      </div>
      <div className="absolute bottom-[20%] left-[40%] animate-pulse delay-300">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD700">
          <path d="M12 0L14.645 9.355L24 12L14.645 14.645L12 24L9.355 14.645L0 12L9.355 9.355L12 0Z" />
        </svg>
      </div>
      <div className="relative z-50 w-[550px] rounded-xl bg-[#1A2031] p-5 text-neutral-50 shadow-xl">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2">
          <div className="relative h-32 w-32">
            <img
              src="https://s-media-cache-ak0.pinimg.com/originals/6a/b3/2c/6ab32c8801ecebba2850f175b389d5fc.png"
              alt="Kirby"
              className="h-full w-full"
            />
          </div>
        </div>
        <div className="relative">
          <div className="absolute -right-3 top-0 animate-pulse">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFD700">
              <path d="M12 0L14.645 9.355L24 12L14.645 14.645L12 24L9.355 14.645L0 12L9.355 9.355L12 0Z" />
            </svg>
          </div>
          <div className="absolute -left-2 top-2 animate-ping delay-150">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFD700">
              <path d="M12 0L14.645 9.355L24 12L14.645 14.645L12 24L9.355 14.645L0 12L9.355 9.355L12 0Z" />
            </svg>
          </div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-medium text-white">AI Analysis Results</h2>
            <button onClick={onClose} className="text-white hover:text-neutral-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#5B50D6]/30 border-t-[#5B50D6]" />
              <p className="text-white">AI is analyzing your deployment error...</p>
            </div>
          ) : (
            result && (
              <div className="space-y-5">
                <ResultSection
                  title="Error Analysis"
                  content={result.error}
                  isError={result.error.includes('Failed to')}
                />
                <ResultSection
                  title="Root Cause"
                  content={result.cause}
                  isError={result.cause.includes('Network or service error')}
                />
                <ResultSection title="Solution" content={result.solution} showFeedback={true} />
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleEditService} className="bg-[#5B50D6] hover:bg-[#6E64D9]">
                    Edit Service Settings
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

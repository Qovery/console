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

export function AIAnalysisModal({
  isOpen,
  onClose,
  loading: initialLoading,
  result: initialResult,
}: AIAnalysisModalProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(initialLoading)
  const [result, setResult] = useState<AIAnalysisResult | undefined>(initialResult)
  const navigate = useNavigate()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

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

      // Log raw data for debugging
      console.log('Raw response data:', response.data)

      // Fonction pour nettoyer le JSON
      const cleanJSON = (jsonString: string) => {
        return jsonString
          .replace(/`/g, "'") // Remplacer les backticks
          .replace(/\n/g, ' ') // Supprimer les sauts de ligne
          .replace(/\s+/g, ' ') // Réduire les espaces multiples
          .trim() // Supprimer les espaces en début/fin
      }

      let parsedData
      if (typeof response.data === 'string') {
        try {
          // Nettoyer et parser le JSON
          const cleanedJsonString = cleanJSON(response.data)
          parsedData = JSON.parse(cleanedJsonString)
        } catch (parseError) {
          console.error('JSON Parsing error:', parseError)
          console.error('Original string:', response.data)

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

      // Définir le résultat avec des valeurs par défaut
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
            <div className="absolute h-full w-full rounded-full border-4 border-pink-500 bg-pink-200">
              <div className="absolute left-1/2 top-8 flex -translate-x-1/2 space-x-6">
                <div className="relative h-8 w-4 rounded-full bg-black">
                  <div className="absolute bottom-1 h-3 w-4 rounded-full bg-blue-600" />
                  <div className="absolute top-1 ml-0.5 h-2 w-3 rounded-full bg-white" />
                </div>
                <div className="relative h-8 w-4 rounded-full bg-black">
                  <div className="absolute bottom-1 h-3 w-4 rounded-full bg-blue-600" />
                  <div className="absolute top-1 ml-0.5 h-2 w-3 rounded-full bg-white" />
                </div>
              </div>
              <div className="absolute left-5 top-16 h-5 w-5 rounded-full bg-pink-400" />
              <div className="absolute right-5 top-16 h-5 w-5 rounded-full bg-pink-400" />
              <div className="absolute bottom-10 left-1/2 h-3 w-4 -translate-x-1/2 rounded-full bg-red-500" />
            </div>
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
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#5B50D6]/30 border-t-[#5B50D6]" />
              <p className="text-neutral-300">AI is analyzing your deployment error...</p>
            </div>
          ) : (
            result && (
              <div className="space-y-5">
                <div className="rounded-lg bg-[#232A3B] p-4">
                  <h3 className="mb-3 text-lg font-medium text-[#5B50D6]">Error Analysis</h3>
                  <p className="text-neutral-300">{result.error}</p>
                </div>
                <div className="rounded-lg bg-[#232A3B] p-4">
                  <h3 className="mb-3 text-lg font-medium text-[#5B50D6]">Root Cause</h3>
                  <p className="text-neutral-300">{result.cause}</p>
                </div>
                <div className="rounded-lg bg-[#232A3B] p-4">
                  <h3 className="mb-3 text-lg font-medium text-[#5B50D6]">Solution</h3>
                  <p className="text-neutral-300">{result.solution}</p>
                </div>
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

export type StreamingStateType = {
  isLoading: boolean
  isFinish: boolean
  isStopped: boolean
  streamingMessage: string
  displayedStreamingMessage: string
  loadingText: string
}

export type StreamingActionType =
  | { type: 'RESET' }
  | { type: 'START_LOADING' }
  | { type: 'UPDATE_STREAMING_MESSAGE'; payload: string }
  | { type: 'UPDATE_DISPLAYED_MESSAGE'; payload: string }
  | { type: 'UPDATE_LOADING_TEXT'; payload: string }
  | { type: 'FINISH' }
  | { type: 'STOP' }

export const INITIAL_STREAMING_STATE: StreamingStateType = {
  isLoading: false,
  isFinish: false,
  isStopped: false,
  streamingMessage: '',
  displayedStreamingMessage: '',
  loadingText: 'Loading...',
}

export function streamingStateReducer(state: StreamingStateType, action: StreamingActionType): StreamingStateType {
  switch (action.type) {
    case 'RESET':
      return INITIAL_STREAMING_STATE

    case 'START_LOADING':
      return {
        ...state,
        isLoading: true,
        isFinish: false,
        isStopped: false,
        streamingMessage: '',
        displayedStreamingMessage: '',
        loadingText: 'Loading...',
      }

    case 'UPDATE_STREAMING_MESSAGE':
      return {
        ...state,
        streamingMessage: action.payload,
      }

    case 'UPDATE_DISPLAYED_MESSAGE':
      return {
        ...state,
        displayedStreamingMessage: action.payload,
      }

    case 'UPDATE_LOADING_TEXT':
      return {
        ...state,
        loadingText: action.payload,
      }

    case 'FINISH':
      return {
        ...state,
        isFinish: true,
        isLoading: false,
      }

    case 'STOP':
      return {
        ...state,
        isStopped: true,
        isFinish: true,
      }

    default:
      return state
  }
}

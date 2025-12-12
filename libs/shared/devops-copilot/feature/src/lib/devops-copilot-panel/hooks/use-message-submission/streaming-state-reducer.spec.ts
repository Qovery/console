import {
  INITIAL_STREAMING_STATE,
  type StreamingActionType,
  type StreamingStateType,
  streamingStateReducer,
} from './streaming-state-reducer'

describe('streamingStateReducer', () => {
  describe('INITIAL_STREAMING_STATE', () => {
    it('should have correct initial values', () => {
      expect(INITIAL_STREAMING_STATE).toEqual({
        isLoading: false,
        isFinish: false,
        isStopped: false,
        streamingMessage: '',
        displayedStreamingMessage: '',
        loadingText: 'Loading...',
      })
    })
  })

  describe('RESET action', () => {
    it('should reset state to initial values', () => {
      const currentState: StreamingStateType = {
        isLoading: true,
        isFinish: true,
        isStopped: true,
        streamingMessage: 'test message',
        displayedStreamingMessage: 'test',
        loadingText: 'Custom loading...',
      }

      const action: StreamingActionType = { type: 'RESET' }
      const newState = streamingStateReducer(currentState, action)

      expect(newState).toEqual(INITIAL_STREAMING_STATE)
    })

    it('should return completely new state object', () => {
      const currentState: StreamingStateType = {
        isLoading: true,
        isFinish: true,
        isStopped: false,
        streamingMessage: 'message',
        displayedStreamingMessage: 'message',
        loadingText: 'Loading...',
      }

      const action: StreamingActionType = { type: 'RESET' }
      const newState = streamingStateReducer(currentState, action)

      expect(newState).not.toBe(currentState)
      expect(newState).toEqual(INITIAL_STREAMING_STATE)
    })
  })

  describe('START_LOADING action', () => {
    it('should set loading state and reset messages', () => {
      const currentState: StreamingStateType = {
        ...INITIAL_STREAMING_STATE,
        isFinish: true,
        streamingMessage: 'old message',
        displayedStreamingMessage: 'old',
      }

      const action: StreamingActionType = { type: 'START_LOADING' }
      const newState = streamingStateReducer(currentState, action)

      expect(newState).toEqual({
        ...currentState,
        isLoading: true,
        isFinish: false,
        isStopped: false,
        streamingMessage: '',
        displayedStreamingMessage: '',
        loadingText: 'Loading...',
      })
    })

    it('should preserve other state values not related to loading', () => {
      const currentState: StreamingStateType = {
        ...INITIAL_STREAMING_STATE,
        isFinish: true,
      }

      const action: StreamingActionType = { type: 'START_LOADING' }
      const newState = streamingStateReducer(currentState, action)

      expect(newState.isLoading).toBe(true)
      expect(newState.isFinish).toBe(false)
    })
  })

  describe('UPDATE_STREAMING_MESSAGE action', () => {
    it('should update streaming message', () => {
      const currentState: StreamingStateType = {
        ...INITIAL_STREAMING_STATE,
        streamingMessage: '',
      }

      const action: StreamingActionType = {
        type: 'UPDATE_STREAMING_MESSAGE',
        payload: 'New streaming message',
      }
      const newState = streamingStateReducer(currentState, action)

      expect(newState.streamingMessage).toBe('New streaming message')
    })

    it('should preserve other state values', () => {
      const currentState: StreamingStateType = {
        ...INITIAL_STREAMING_STATE,
        isLoading: true,
        displayedStreamingMessage: 'displayed',
      }

      const action: StreamingActionType = {
        type: 'UPDATE_STREAMING_MESSAGE',
        payload: 'test',
      }
      const newState = streamingStateReducer(currentState, action)

      expect(newState.isLoading).toBe(true)
      expect(newState.displayedStreamingMessage).toBe('displayed')
      expect(newState.streamingMessage).toBe('test')
    })

    it('should handle empty string payload', () => {
      const currentState: StreamingStateType = {
        ...INITIAL_STREAMING_STATE,
        streamingMessage: 'existing',
      }

      const action: StreamingActionType = {
        type: 'UPDATE_STREAMING_MESSAGE',
        payload: '',
      }
      const newState = streamingStateReducer(currentState, action)

      expect(newState.streamingMessage).toBe('')
    })
  })

  describe('UPDATE_DISPLAYED_MESSAGE action', () => {
    it('should update displayed streaming message', () => {
      const currentState: StreamingStateType = {
        ...INITIAL_STREAMING_STATE,
        displayedStreamingMessage: '',
      }

      const action: StreamingActionType = {
        type: 'UPDATE_DISPLAYED_MESSAGE',
        payload: 'Displayed message',
      }
      const newState = streamingStateReducer(currentState, action)

      expect(newState.displayedStreamingMessage).toBe('Displayed message')
    })

    it('should preserve other state values', () => {
      const currentState: StreamingStateType = {
        ...INITIAL_STREAMING_STATE,
        isLoading: true,
        streamingMessage: 'full message',
      }

      const action: StreamingActionType = {
        type: 'UPDATE_DISPLAYED_MESSAGE',
        payload: 'partial',
      }
      const newState = streamingStateReducer(currentState, action)

      expect(newState.isLoading).toBe(true)
      expect(newState.streamingMessage).toBe('full message')
      expect(newState.displayedStreamingMessage).toBe('partial')
    })
  })

  describe('UPDATE_LOADING_TEXT action', () => {
    it('should update loading text', () => {
      const currentState: StreamingStateType = {
        ...INITIAL_STREAMING_STATE,
        loadingText: 'Loading...',
      }

      const action: StreamingActionType = {
        type: 'UPDATE_LOADING_TEXT',
        payload: 'Processing request...',
      }
      const newState = streamingStateReducer(currentState, action)

      expect(newState.loadingText).toBe('Processing request...')
    })

    it('should preserve other state values', () => {
      const currentState: StreamingStateType = {
        ...INITIAL_STREAMING_STATE,
        isLoading: true,
        streamingMessage: 'message',
      }

      const action: StreamingActionType = {
        type: 'UPDATE_LOADING_TEXT',
        payload: 'Custom text',
      }
      const newState = streamingStateReducer(currentState, action)

      expect(newState.isLoading).toBe(true)
      expect(newState.streamingMessage).toBe('message')
      expect(newState.loadingText).toBe('Custom text')
    })
  })

  describe('FINISH action', () => {
    it('should set finish state and stop loading', () => {
      const currentState: StreamingStateType = {
        ...INITIAL_STREAMING_STATE,
        isLoading: true,
        isFinish: false,
      }

      const action: StreamingActionType = { type: 'FINISH' }
      const newState = streamingStateReducer(currentState, action)

      expect(newState.isFinish).toBe(true)
      expect(newState.isLoading).toBe(false)
    })

    it('should preserve streaming messages', () => {
      const currentState: StreamingStateType = {
        ...INITIAL_STREAMING_STATE,
        isLoading: true,
        streamingMessage: 'Complete message',
        displayedStreamingMessage: 'Complete message',
      }

      const action: StreamingActionType = { type: 'FINISH' }
      const newState = streamingStateReducer(currentState, action)

      expect(newState.streamingMessage).toBe('Complete message')
      expect(newState.displayedStreamingMessage).toBe('Complete message')
      expect(newState.isFinish).toBe(true)
      expect(newState.isLoading).toBe(false)
    })

    it('should not change isStopped state', () => {
      const currentState: StreamingStateType = {
        ...INITIAL_STREAMING_STATE,
        isLoading: true,
        isStopped: false,
      }

      const action: StreamingActionType = { type: 'FINISH' }
      const newState = streamingStateReducer(currentState, action)

      expect(newState.isStopped).toBe(false)
    })
  })

  describe('STOP action', () => {
    it('should set stopped and finish states', () => {
      const currentState: StreamingStateType = {
        ...INITIAL_STREAMING_STATE,
        isLoading: true,
        isStopped: false,
        isFinish: false,
      }

      const action: StreamingActionType = { type: 'STOP' }
      const newState = streamingStateReducer(currentState, action)

      expect(newState.isStopped).toBe(true)
      expect(newState.isFinish).toBe(true)
    })

    it('should preserve streaming messages when stopped', () => {
      const currentState: StreamingStateType = {
        ...INITIAL_STREAMING_STATE,
        streamingMessage: 'Partial message',
        displayedStreamingMessage: 'Partial',
      }

      const action: StreamingActionType = { type: 'STOP' }
      const newState = streamingStateReducer(currentState, action)

      expect(newState.streamingMessage).toBe('Partial message')
      expect(newState.displayedStreamingMessage).toBe('Partial')
    })

    it('should not change isLoading state', () => {
      const currentState: StreamingStateType = {
        ...INITIAL_STREAMING_STATE,
        isLoading: true,
      }

      const action: StreamingActionType = { type: 'STOP' }
      const newState = streamingStateReducer(currentState, action)

      expect(newState.isLoading).toBe(true)
      expect(newState.isStopped).toBe(true)
      expect(newState.isFinish).toBe(true)
    })
  })

  describe('default case', () => {
    it('should return current state for unknown action', () => {
      const currentState: StreamingStateType = {
        ...INITIAL_STREAMING_STATE,
        streamingMessage: 'test',
      }

      const action = { type: 'UNKNOWN_ACTION' } as unknown as StreamingActionType
      const newState = streamingStateReducer(currentState, action)

      expect(newState).toBe(currentState)
    })
  })

  describe('action sequencing', () => {
    it('should handle START_LOADING -> UPDATE_STREAMING_MESSAGE -> FINISH sequence', () => {
      let state = INITIAL_STREAMING_STATE

      state = streamingStateReducer(state, { type: 'START_LOADING' })
      expect(state.isLoading).toBe(true)
      expect(state.streamingMessage).toBe('')

      state = streamingStateReducer(state, {
        type: 'UPDATE_STREAMING_MESSAGE',
        payload: 'Complete message',
      })
      expect(state.streamingMessage).toBe('Complete message')

      state = streamingStateReducer(state, { type: 'FINISH' })
      expect(state.isFinish).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.streamingMessage).toBe('Complete message')
    })

    it('should handle STOP interrupting loading sequence', () => {
      let state = INITIAL_STREAMING_STATE

      state = streamingStateReducer(state, { type: 'START_LOADING' })
      state = streamingStateReducer(state, {
        type: 'UPDATE_STREAMING_MESSAGE',
        payload: 'Partial',
      })
      state = streamingStateReducer(state, { type: 'STOP' })

      expect(state.isStopped).toBe(true)
      expect(state.isFinish).toBe(true)
      expect(state.streamingMessage).toBe('Partial')
    })

    it('should handle RESET after completion', () => {
      let state = INITIAL_STREAMING_STATE

      state = streamingStateReducer(state, { type: 'START_LOADING' })
      state = streamingStateReducer(state, {
        type: 'UPDATE_STREAMING_MESSAGE',
        payload: 'Message',
      })
      state = streamingStateReducer(state, { type: 'FINISH' })
      state = streamingStateReducer(state, { type: 'RESET' })

      expect(state).toEqual(INITIAL_STREAMING_STATE)
    })
  })
})

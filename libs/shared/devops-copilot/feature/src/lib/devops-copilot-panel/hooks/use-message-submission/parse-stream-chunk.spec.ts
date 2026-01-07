import { parseStreamChunk } from './parse-stream-chunk'

describe('parseStreamChunk', () => {
  describe('start type', () => {
    it('should parse start chunk with thread_id', () => {
      const chunk = JSON.stringify({
        type: 'start',
        content: { thread_id: 'thread-123' },
      })

      const result = parseStreamChunk(chunk, '')

      expect(result).toEqual({
        type: 'start',
        data: { threadId: 'thread-123' },
      })
    })

    it('should return null for start chunk without thread_id', () => {
      const chunk = JSON.stringify({
        type: 'start',
        content: {},
      })

      const result = parseStreamChunk(chunk, '')

      expect(result).toBeNull()
    })
  })

  describe('plan type', () => {
    it('should parse plan chunk with valid plan array', () => {
      const planArray = [
        { description: 'Step 1', tool_name: 'tool1' },
        { description: 'Step 2', tool_name: 'tool2' },
      ]
      const chunk = JSON.stringify({
        type: 'chunk',
        content: `__plan__:${JSON.stringify(planArray)}`,
      })

      const result = parseStreamChunk(chunk, '')

      expect(result).toEqual({
        type: 'plan',
        data: {
          plan: [
            {
              messageId: 'temp',
              description: 'Step 1',
              toolName: 'tool1',
              status: 'not_started',
            },
            {
              messageId: 'temp',
              description: 'Step 2',
              toolName: 'tool2',
              status: 'not_started',
            },
          ],
        },
      })
    })

    it('should return null for invalid plan JSON', () => {
      const chunk = JSON.stringify({
        type: 'chunk',
        content: '__plan__:invalid-json',
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = parseStreamChunk(chunk, '')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse plan:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('step_plan_reset type', () => {
    it('should parse generating plan chunk', () => {
      const chunk = JSON.stringify({
        type: 'chunk',
        content: '__stepPlan__:generating_a_new_plan',
      })

      const result = parseStreamChunk(chunk, '')

      expect(result).toEqual({
        type: 'step_plan_reset',
        data: { loadingText: 'Generating a new plan...' },
      })
    })
  })

  describe('step_plan type', () => {
    it('should parse step_plan chunk with valid step object', () => {
      const stepObj = { description: 'analyzing code', status: 'in_progress' }
      const chunk = JSON.stringify({
        type: 'chunk',
        content: `__stepPlan__:${JSON.stringify(stepObj)}`,
      })

      const result = parseStreamChunk(chunk, '')

      expect(result).toEqual({
        type: 'step_plan',
        data: {
          stepUpdate: { description: 'analyzing code', status: 'in_progress' },
          loadingText: 'Analyzing code',
        },
      })
    })

    it('should return null for step_plan without valid JSON', () => {
      const chunk = JSON.stringify({
        type: 'chunk',
        content: '__stepPlan__:not-a-json',
      })

      const result = parseStreamChunk(chunk, '')

      expect(result).toBeNull()
    })

    it('should return null for step_plan with empty content', () => {
      const chunk = JSON.stringify({
        type: 'chunk',
        content: '__stepPlan__:',
      })

      const result = parseStreamChunk(chunk, '')

      expect(result).toBeNull()
    })

    it('should return null for step_plan without description or status', () => {
      const chunk = JSON.stringify({
        type: 'chunk',
        content: '__stepPlan__:{"description":"test"}',
      })

      const result = parseStreamChunk(chunk, '')

      expect(result).toEqual({
        type: 'content',
        data: { content: '__stepPlan__:{"description":"test"}' },
      })
    })
  })

  describe('step type', () => {
    it('should parse step chunk and format description', () => {
      const chunk = JSON.stringify({
        type: 'chunk',
        content: '__step__:running_tests',
      })

      const result = parseStreamChunk(chunk, '')

      expect(result).toEqual({
        type: 'step',
        data: { loadingText: 'Running tests' },
      })
    })

    it('should capitalize first letter of step description', () => {
      const chunk = JSON.stringify({
        type: 'chunk',
        content: '__step__:building_project',
      })

      const result = parseStreamChunk(chunk, '')

      expect(result).toEqual({
        type: 'step',
        data: { loadingText: 'Building project' },
      })
    })
  })

  describe('content type', () => {
    it('should append content to current content', () => {
      const chunk = JSON.stringify({
        type: 'chunk',
        content: 'Hello ',
      })

      const result = parseStreamChunk(chunk, 'Previous content. ')

      expect(result).toEqual({
        type: 'content',
        data: { content: 'Previous content. Hello ' },
      })
    })

    it('should handle empty current content', () => {
      const chunk = JSON.stringify({
        type: 'chunk',
        content: 'New content',
      })

      const result = parseStreamChunk(chunk, '')

      expect(result).toEqual({
        type: 'content',
        data: { content: 'New content' },
      })
    })
  })

  describe('error handling', () => {
    it('should return null for invalid JSON', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = parseStreamChunk('not-valid-json', '')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Error parsing chunk:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('should return null for unknown chunk type', () => {
      const chunk = JSON.stringify({
        type: 'unknown',
        content: 'something',
      })

      const result = parseStreamChunk(chunk, '')

      expect(result).toBeNull()
    })
  })
})

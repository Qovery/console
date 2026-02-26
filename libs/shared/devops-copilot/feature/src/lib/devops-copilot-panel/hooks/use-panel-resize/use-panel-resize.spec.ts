/* eslint-disable jest-dom/prefer-to-have-style */
import { createRef } from 'react'
import { act, renderHook } from '@qovery/shared/util-tests'
import { usePanelResize } from './use-panel-resize'

describe('usePanelResize', () => {
  const STORAGE_KEY = 'test-panel-size'
  let mockPanelElement: HTMLDivElement

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()

    mockPanelElement = document.createElement('div')
    Object.defineProperty(mockPanelElement, 'offsetWidth', { value: 480, writable: true })
    Object.defineProperty(mockPanelElement, 'offsetHeight', { value: 600, writable: true })
    Object.defineProperty(mockPanelElement, 'style', {
      value: {
        width: '',
        height: '',
        top: '',
        left: '',
        bottom: '',
        right: '',
      },
      writable: true,
    })
  })

  describe('initial state', () => {
    it('should return isResizing as false initially', () => {
      const panelRef = createRef<HTMLDivElement>()
      const { result } = renderHook(() =>
        usePanelResize({
          panelRef,
          expand: false,
          storageKey: STORAGE_KEY,
        })
      )

      expect(result.current.isResizing).toBe(false)
    })

    it('should return startResize function', () => {
      const panelRef = createRef<HTMLDivElement>()
      const { result } = renderHook(() =>
        usePanelResize({
          panelRef,
          expand: false,
          storageKey: STORAGE_KEY,
        })
      )

      expect(typeof result.current.startResize).toBe('function')
    })
  })

  describe('panel sizing on mount', () => {
    it('should apply expanded size when expand is true', () => {
      const panelRef = { current: mockPanelElement }
      renderHook(() =>
        usePanelResize({
          panelRef,
          expand: true,
          storageKey: STORAGE_KEY,
        })
      )

      expect(mockPanelElement.style.width).toBe('calc(100vw - 32px)')
      expect(mockPanelElement.style.height).toBe('calc(100vh - 32px)')
      expect(mockPanelElement.style.top).toBe('1rem')
      expect(mockPanelElement.style.left).toBe('1rem')
    })

    it('should apply default size when no stored size and not expanded', () => {
      const panelRef = { current: mockPanelElement }
      Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true })

      renderHook(() =>
        usePanelResize({
          panelRef,
          expand: false,
          storageKey: STORAGE_KEY,
        })
      )

      expect(mockPanelElement.style.width).toBe('480px')
      expect(mockPanelElement.style.height).toBe('600px')
      expect(mockPanelElement.style.bottom).toBe('8px')
      expect(mockPanelElement.style.right).toBe('8px')
    })

    it('should restore size from localStorage when available', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ width: 600, height: 700 }))
      const panelRef = { current: mockPanelElement }
      Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true })

      renderHook(() =>
        usePanelResize({
          panelRef,
          expand: false,
          storageKey: STORAGE_KEY,
        })
      )

      expect(mockPanelElement.style.width).toBe('600px')
      expect(mockPanelElement.style.height).toBe('700px')
    })

    it('should cap size at 90% of window dimensions', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ width: 2000, height: 1500 }))
      const panelRef = { current: mockPanelElement }
      Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true })

      renderHook(() =>
        usePanelResize({
          panelRef,
          expand: false,
          storageKey: STORAGE_KEY,
        })
      )

      expect(mockPanelElement.style.width).toBe('900px')
      expect(mockPanelElement.style.height).toBe('720px')
    })

    it('should handle invalid JSON in localStorage gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json')
      const panelRef = { current: mockPanelElement }
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      renderHook(() =>
        usePanelResize({
          panelRef,
          expand: false,
          storageKey: STORAGE_KEY,
        })
      )

      expect(mockPanelElement.style.width).toBe('480px')
      expect(mockPanelElement.style.height).toBe('600px')
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('startResize', () => {
    it('should set isResizing to true when resize starts', () => {
      const panelRef = { current: mockPanelElement }
      const { result } = renderHook(() =>
        usePanelResize({
          panelRef,
          expand: false,
          storageKey: STORAGE_KEY,
        })
      )

      const mockEvent = {
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent

      act(() => {
        result.current.startResize(mockEvent)
      })

      expect(result.current.isResizing).toBe(true)
    })

    it('should prevent default event behavior', () => {
      const panelRef = { current: mockPanelElement }
      const { result } = renderHook(() =>
        usePanelResize({
          panelRef,
          expand: false,
          storageKey: STORAGE_KEY,
        })
      )

      const mockEvent = {
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent

      act(() => {
        result.current.startResize(mockEvent)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('should do nothing if panelRef.current is null', () => {
      const panelRef = { current: null }
      const { result } = renderHook(() =>
        usePanelResize({
          panelRef,
          expand: false,
          storageKey: STORAGE_KEY,
        })
      )

      const mockEvent = {
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent

      act(() => {
        result.current.startResize(mockEvent)
      })

      expect(result.current.isResizing).toBe(false)
    })
  })

  describe('resize constraints', () => {
    it('should enforce minimum width of 450px', () => {
      const panelRef = { current: mockPanelElement }
      const getBoundingClientRectMock = jest.fn(() => ({
        left: 500,
        top: 200,
        right: 980,
        bottom: 800,
        width: 480,
        height: 600,
      }))
      mockPanelElement.getBoundingClientRect =
        getBoundingClientRectMock as unknown as typeof mockPanelElement.getBoundingClientRect

      const { result } = renderHook(() =>
        usePanelResize({
          panelRef,
          expand: false,
          storageKey: STORAGE_KEY,
        })
      )

      const mockMouseDownEvent = {
        preventDefault: jest.fn(),
        clientX: 980,
        clientY: 800,
      } as unknown as React.MouseEvent

      act(() => {
        result.current.startResize(mockMouseDownEvent)
      })

      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 600,
        clientY: 400,
      })

      act(() => {
        document.dispatchEvent(mouseMoveEvent)
      })

      expect(parseInt(mockPanelElement.style.width)).toBeGreaterThanOrEqual(450)
    })

    it('should enforce minimum height of 600px', () => {
      const panelRef = { current: mockPanelElement }
      const getBoundingClientRectMock = jest.fn(() => ({
        left: 500,
        top: 200,
        right: 980,
        bottom: 800,
        width: 480,
        height: 600,
      }))
      mockPanelElement.getBoundingClientRect =
        getBoundingClientRectMock as unknown as typeof mockPanelElement.getBoundingClientRect

      const { result } = renderHook(() =>
        usePanelResize({
          panelRef,
          expand: false,
          storageKey: STORAGE_KEY,
        })
      )

      const mockMouseDownEvent = {
        preventDefault: jest.fn(),
        clientX: 980,
        clientY: 800,
      } as unknown as React.MouseEvent

      act(() => {
        result.current.startResize(mockMouseDownEvent)
      })

      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 900,
        clientY: 300,
      })

      act(() => {
        document.dispatchEvent(mouseMoveEvent)
      })

      expect(parseInt(mockPanelElement.style.height)).toBeGreaterThanOrEqual(600)
    })
  })

  describe('window resize handling', () => {
    it('should reapply panel size on window resize', () => {
      const panelRef = { current: mockPanelElement }
      renderHook(() =>
        usePanelResize({
          panelRef,
          expand: false,
          storageKey: STORAGE_KEY,
        })
      )

      const initialWidth = mockPanelElement.style.width

      act(() => {
        window.dispatchEvent(new Event('resize'))
      })

      expect(mockPanelElement.style.width).toBe(initialWidth)
    })
  })
})

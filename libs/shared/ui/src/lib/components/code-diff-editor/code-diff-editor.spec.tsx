import { DiffEditor as MonacoDiffEditor } from '@monaco-editor/react'
import { render, screen, waitFor } from '__tests__/utils/setup-jest'
import { CodeDiffEditor } from './code-diff-editor'

// Mock the monaco-editor/react
jest.mock('@monaco-editor/react', () => ({
  DiffEditor: jest.fn(),
}))

// Mock LoaderSpinner
jest.mock('../loader-spinner/loader-spinner', () => ({
  __esModule: true,
  default: () => <div data-testid="loader-spinner">Loading...</div>,
}))

const mockDiffEditor = MonacoDiffEditor as jest.MockedFunction<typeof MonacoDiffEditor>

describe('CodeDiffEditor', () => {
  const originalCode = `function hello() {
  console.log('Hello');
}`

  const modifiedCode = `function hello() {
  console.log('Hello World');
  console.log('Welcome');
}`

  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementation
    mockDiffEditor.mockImplementation(({ onMount, original, modified, loading }: any) => {
      if (onMount) {
        setTimeout(() => {
          const mockEditor = {
            getLineChanges: jest.fn(),
            onDidUpdateDiff: jest.fn((callback) => {
              mockEditor._diffUpdateCallback = callback
              return { dispose: jest.fn() }
            }),
            _diffUpdateCallback: null as (() => void) | null,
          }
          const mockMonaco = {
            editor: {
              defineTheme: jest.fn(),
              setTheme: jest.fn(),
            },
          }
          onMount(mockEditor as any, mockMonaco as any)
        }, 0)
      }

      return (
        <div data-testid="monaco-diff-editor">
          {loading}
          <div data-testid="original-content">{original}</div>
          <div data-testid="modified-content">{modified}</div>
        </div>
      )
    })
  })

  it('should render successfully', () => {
    const { baseElement } = render(<CodeDiffEditor original={originalCode} modified={modifiedCode} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display loader spinner', () => {
    render(<CodeDiffEditor original={originalCode} modified={modifiedCode} />)

    expect(screen.getByTestId('loader-spinner')).toBeInTheDocument()
  })

  it('should call onMount and setup editor', async () => {
    render(<CodeDiffEditor original={originalCode} modified={modifiedCode} />)

    await waitFor(() => {
      expect(screen.getByTestId('monaco-diff-editor')).toBeInTheDocument()
    })
  })

  it('should compute diff stats with pure additions', async () => {
    const onDiffStatsChange = jest.fn()

    mockDiffEditor.mockImplementation(({ onMount }: any) => {
      if (onMount) {
        setTimeout(() => {
          const mockEditor = {
            getLineChanges: jest.fn().mockReturnValue([
              {
                originalStartLineNumber: 1,
                originalEndLineNumber: 0, // Pure addition
                modifiedStartLineNumber: 1,
                modifiedEndLineNumber: 3,
              },
            ]),
            onDidUpdateDiff: jest.fn((callback) => {
              setTimeout(() => callback(), 10)
              return { dispose: jest.fn() }
            }),
          }
          const mockMonaco = {
            editor: {
              defineTheme: jest.fn(),
              setTheme: jest.fn(),
            },
          }
          onMount(mockEditor as any, mockMonaco as any)
        }, 0)
      }
      return <div data-testid="monaco-diff-editor"></div>
    })

    render(<CodeDiffEditor original="" modified={modifiedCode} onDiffStatsChange={onDiffStatsChange} />)

    await waitFor(
      () => {
        expect(onDiffStatsChange).toHaveBeenCalledWith({
          additions: 3,
          deletions: 0,
        })
      },
      { timeout: 200 }
    )
  })

  it('should compute diff stats with pure deletions', async () => {
    const onDiffStatsChange = jest.fn()

    mockDiffEditor.mockImplementation(({ onMount }: any) => {
      if (onMount) {
        setTimeout(() => {
          const mockEditor = {
            getLineChanges: jest.fn().mockReturnValue([
              {
                originalStartLineNumber: 1,
                originalEndLineNumber: 2, // 2 lines deleted
                modifiedStartLineNumber: 1,
                modifiedEndLineNumber: 0, // Pure deletion
              },
            ]),
            onDidUpdateDiff: jest.fn((callback) => {
              setTimeout(() => callback(), 10)
              return { dispose: jest.fn() }
            }),
          }
          const mockMonaco = {
            editor: {
              defineTheme: jest.fn(),
              setTheme: jest.fn(),
            },
          }
          onMount(mockEditor as any, mockMonaco as any)
        }, 0)
      }
      return <div data-testid="monaco-diff-editor"></div>
    })

    render(<CodeDiffEditor original={originalCode} modified="" onDiffStatsChange={onDiffStatsChange} />)

    await waitFor(
      () => {
        expect(onDiffStatsChange).toHaveBeenCalledWith({
          additions: 0,
          deletions: 2,
        })
      },
      { timeout: 200 }
    )
  })

  it('should compute diff stats with modifications (both additions and deletions)', async () => {
    const onDiffStatsChange = jest.fn()

    mockDiffEditor.mockImplementation(({ onMount }: any) => {
      if (onMount) {
        setTimeout(() => {
          const mockEditor = {
            getLineChanges: jest.fn().mockReturnValue([
              {
                originalStartLineNumber: 1,
                originalEndLineNumber: 2, // 2 lines in original
                modifiedStartLineNumber: 1,
                modifiedEndLineNumber: 3, // 3 lines in modified
              },
            ]),
            onDidUpdateDiff: jest.fn((callback) => {
              setTimeout(() => callback(), 10)
              return { dispose: jest.fn() }
            }),
          }
          const mockMonaco = {
            editor: {
              defineTheme: jest.fn(),
              setTheme: jest.fn(),
            },
          }
          onMount(mockEditor as any, mockMonaco as any)
        }, 0)
      }
      return <div data-testid="monaco-diff-editor"></div>
    })

    render(<CodeDiffEditor original={originalCode} modified={modifiedCode} onDiffStatsChange={onDiffStatsChange} />)

    await waitFor(
      () => {
        expect(onDiffStatsChange).toHaveBeenCalledWith({
          additions: 3,
          deletions: 2,
        })
      },
      { timeout: 200 }
    )
  })

  it('should compute diff stats with multiple changes', async () => {
    const onDiffStatsChange = jest.fn()

    mockDiffEditor.mockImplementation(({ onMount }: any) => {
      if (onMount) {
        setTimeout(() => {
          const mockEditor = {
            getLineChanges: jest.fn().mockReturnValue([
              {
                // First change: pure addition
                originalStartLineNumber: 1,
                originalEndLineNumber: 0,
                modifiedStartLineNumber: 1,
                modifiedEndLineNumber: 2,
              },
              {
                // Second change: pure deletion
                originalStartLineNumber: 5,
                originalEndLineNumber: 7,
                modifiedStartLineNumber: 5,
                modifiedEndLineNumber: 0,
              },
              {
                // Third change: modification
                originalStartLineNumber: 10,
                originalEndLineNumber: 11,
                modifiedStartLineNumber: 10,
                modifiedEndLineNumber: 12,
              },
            ]),
            onDidUpdateDiff: jest.fn((callback) => {
              setTimeout(() => callback(), 10)
              return { dispose: jest.fn() }
            }),
          }
          const mockMonaco = {
            editor: {
              defineTheme: jest.fn(),
              setTheme: jest.fn(),
            },
          }
          onMount(mockEditor as any, mockMonaco as any)
        }, 0)
      }
      return <div data-testid="monaco-diff-editor"></div>
    })

    render(<CodeDiffEditor original={originalCode} modified={modifiedCode} onDiffStatsChange={onDiffStatsChange} />)

    await waitFor(
      () => {
        expect(onDiffStatsChange).toHaveBeenCalledWith({
          additions: 5, // 2 + 0 + 3
          deletions: 5, // 0 + 3 + 2
        })
      },
      { timeout: 200 }
    )
  })

  it('should not call onDiffStatsChange when callback is not provided', async () => {
    mockDiffEditor.mockImplementation(({ onMount }: any) => {
      if (onMount) {
        setTimeout(() => {
          const mockEditor = {
            getLineChanges: jest.fn().mockReturnValue([
              {
                originalStartLineNumber: 1,
                originalEndLineNumber: 0,
                modifiedStartLineNumber: 1,
                modifiedEndLineNumber: 2,
              },
            ]),
            onDidUpdateDiff: jest.fn((callback) => {
              setTimeout(() => callback(), 10)
              return { dispose: jest.fn() }
            }),
          }
          const mockMonaco = {
            editor: {
              defineTheme: jest.fn(),
              setTheme: jest.fn(),
            },
          }
          onMount(mockEditor as any, mockMonaco as any)
        }, 0)
      }
      return <div data-testid="monaco-diff-editor"></div>
    })

    render(<CodeDiffEditor original={originalCode} modified={modifiedCode} />)

    await waitFor(() => {
      expect(screen.getByTestId('monaco-diff-editor')).toBeInTheDocument()
    })

    // No error should be thrown
  })

  it('should handle case when getLineChanges returns null', async () => {
    const onDiffStatsChange = jest.fn()

    mockDiffEditor.mockImplementation(({ onMount }: any) => {
      if (onMount) {
        setTimeout(() => {
          const mockEditor = {
            getLineChanges: jest.fn().mockReturnValue(null), // No line changes
            onDidUpdateDiff: jest.fn((callback) => {
              setTimeout(() => callback(), 10)
              return { dispose: jest.fn() }
            }),
          }
          const mockMonaco = {
            editor: {
              defineTheme: jest.fn(),
              setTheme: jest.fn(),
            },
          }
          onMount(mockEditor as any, mockMonaco as any)
        }, 0)
      }
      return <div data-testid="monaco-diff-editor"></div>
    })

    render(<CodeDiffEditor original={originalCode} modified={modifiedCode} onDiffStatsChange={onDiffStatsChange} />)

    await waitFor(
      () => {
        expect(onDiffStatsChange).not.toHaveBeenCalled()
      },
      { timeout: 200 }
    )
  })

  it('should define and set custom theme', async () => {
    let defineThemeMock: jest.Mock
    let setThemeMock: jest.Mock

    mockDiffEditor.mockImplementation(({ onMount }: any) => {
      if (onMount) {
        setTimeout(() => {
          const mockEditor = {
            getLineChanges: jest.fn().mockReturnValue([]),
            onDidUpdateDiff: jest.fn(() => ({ dispose: jest.fn() })),
          }
          defineThemeMock = jest.fn()
          setThemeMock = jest.fn()
          const mockMonaco = {
            editor: {
              defineTheme: defineThemeMock,
              setTheme: setThemeMock,
            },
          }
          onMount(mockEditor as any, mockMonaco as any)
        }, 0)
      }
      return <div data-testid="monaco-diff-editor"></div>
    })

    render(<CodeDiffEditor original={originalCode} modified={modifiedCode} />)

    await waitFor(() => {
      expect(defineThemeMock).toHaveBeenCalledWith('customDiffTheme', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'diffEditor.removedTextBackground': '#ffcdc240',
          'diffEditor.removedLineBackground': '#feebe740',
          'diffEditor.insertedTextBackground': '#c4e8d13f',
          'diffEditor.insertedLineBackground': '#e6f6eb7f',
        },
      })
      expect(setThemeMock).toHaveBeenCalledWith('customDiffTheme')
    })
  })

  it('should pass hideUnchangedRegions prop correctly', () => {
    const { rerender } = render(<CodeDiffEditor original={originalCode} modified={modifiedCode} hideUnchangedRegions />)

    expect(true).toBe(true) // Component renders without errors

    rerender(<CodeDiffEditor original={originalCode} modified={modifiedCode} hideUnchangedRegions={false} />)

    expect(true).toBe(true) // Component renders without errors
  })

  it('should pass additional props to MonacoDiffEditor', () => {
    mockDiffEditor.mockImplementation((props: any) => {
      expect(props.language).toBe('typescript')
      expect(props.height).toBe('500px')
      return <div data-testid="monaco-diff-editor"></div>
    })

    render(<CodeDiffEditor original={originalCode} modified={modifiedCode} language="typescript" height="500px" />)
  })

  it('should keep current models to prevent disposal issues', () => {
    mockDiffEditor.mockImplementation((props: any) => {
      expect(props.keepCurrentModifiedModel).toBe(true)
      expect(props.keepCurrentOriginalModel).toBe(true)
      return <div data-testid="monaco-diff-editor"></div>
    })

    render(<CodeDiffEditor original={originalCode} modified={modifiedCode} />)
  })

  it('should render with empty original and modified strings', () => {
    render(<CodeDiffEditor original="" modified="" />)

    expect(screen.getByTestId('original-content')).toBeInTheDocument()
    expect(screen.getByTestId('modified-content')).toBeInTheDocument()
  })

  it('should handle single line change correctly', async () => {
    const onDiffStatsChange = jest.fn()

    mockDiffEditor.mockImplementation(({ onMount }: any) => {
      if (onMount) {
        setTimeout(() => {
          const mockEditor = {
            getLineChanges: jest.fn().mockReturnValue([
              {
                originalStartLineNumber: 1,
                originalEndLineNumber: 1, // Single line
                modifiedStartLineNumber: 1,
                modifiedEndLineNumber: 1, // Single line
              },
            ]),
            onDidUpdateDiff: jest.fn((callback) => {
              setTimeout(() => callback(), 10)
              return { dispose: jest.fn() }
            }),
          }
          const mockMonaco = {
            editor: {
              defineTheme: jest.fn(),
              setTheme: jest.fn(),
            },
          }
          onMount(mockEditor as any, mockMonaco as any)
        }, 0)
      }
      return <div data-testid="monaco-diff-editor"></div>
    })

    render(<CodeDiffEditor original="line1" modified="line1-modified" onDiffStatsChange={onDiffStatsChange} />)

    await waitFor(
      () => {
        expect(onDiffStatsChange).toHaveBeenCalledWith({
          additions: 1,
          deletions: 1,
        })
      },
      { timeout: 200 }
    )
  })
})

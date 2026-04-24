import type { FitAddon } from '@xterm/addon-fit'
import { type IDisposable, type ITerminalAddon, type Terminal } from '@xterm/xterm'
import Color from 'color'

export interface TerminalBannerColors {
  accent1: string
  positive: string
  subtle: string
  warning: string
}

interface TerminalBannerSegment {
  bold?: boolean
  color?: string
  text: string
}

/**
 * Renders the terminal onboarding banner and handles copying a command to the
 * clipboard when a "[copy command]" link is clicked.
 */
export class TerminalShellActionsAddon implements ITerminalAddon {
  private static readonly COPY_COMMAND_LABEL = '[copy command]'
  private static readonly FIRST_COMMAND_TITLE = '1. Use $ qovery shell in your local terminal'
  private static readonly SECOND_COMMAND_TITLE = '2. Use $ qovery port-forward in your local terminal'
  private static readonly LOOKBACK_LINE_COUNT = 6

  private linkProviderDisposable?: IDisposable
  private resizeDisposable?: IDisposable
  private bannerRenderTimeoutId?: ReturnType<typeof setTimeout>
  private hasRenderedBanner = false
  private static readonly ANSI_BOLD = '\u001b[1m'
  private static readonly ANSI_RESET = '\u001b[0m'

  constructor(
    private readonly fitAddon: FitAddon,
    private readonly colors: TerminalBannerColors,
    private readonly getPortForwardCommand: () => string,
    private readonly getShellCommand: () => string,
    private readonly shouldWriteBanner: boolean
  ) {}

  private toAnsiColor(color: string): string {
    const [r, g, b] = Color(color)
      .rgb()
      .array()
      .map((value) => Math.round(value))

    return `\u001b[38;2;${r};${g};${b}m`
  }

  // Applies ANSI styles to a text segment before writing it inside the banner box.
  private formatSegment(segment: TerminalBannerSegment): string {
    const stylePrefix = `${segment.bold ? TerminalShellActionsAddon.ANSI_BOLD : ''}${segment.color ? this.toAnsiColor(segment.color) : ''}`
    if (!stylePrefix) {
      return segment.text
    }

    return `${stylePrefix}${segment.text}${TerminalShellActionsAddon.ANSI_RESET}`
  }

  // Truncates segments to a single-line width and pads the remainder to keep box alignment.
  private clampSegments(
    segments: TerminalBannerSegment[],
    maxWidth: number
  ): {
    clippedSegments: TerminalBannerSegment[]
    trailingPadding: string
  } {
    const clippedSegments: TerminalBannerSegment[] = []
    let remainingWidth = maxWidth

    segments.forEach((segment) => {
      if (remainingWidth <= 0) {
        return
      }

      const clippedText = segment.text.slice(0, remainingWidth)
      if (!clippedText) {
        return
      }

      clippedSegments.push({
        ...segment,
        text: clippedText,
      })
      remainingWidth -= clippedText.length
    })

    return {
      clippedSegments,
      trailingPadding: ' '.repeat(Math.max(0, remainingWidth)),
    }
  }

  // Splits long segments across multiple lines so content fits within the banner box width.
  private wrapSegments(segments: TerminalBannerSegment[], maxWidth: number): TerminalBannerSegment[][] {
    if (!segments.some((segment) => segment.text.length > 0)) {
      return [[{ text: '' }]]
    }

    const wrappedLines: TerminalBannerSegment[][] = []
    let currentLine: TerminalBannerSegment[] = []
    let remainingWidth = maxWidth

    segments.forEach((segment) => {
      let remainingText = segment.text

      while (remainingText.length > 0) {
        if (remainingWidth <= 0) {
          wrappedLines.push(currentLine)
          currentLine = []
          remainingWidth = maxWidth
        }

        const chunkLength = Math.min(remainingWidth, remainingText.length)
        const chunk = remainingText.slice(0, chunkLength)

        currentLine.push({
          ...segment,
          text: chunk,
        })

        remainingText = remainingText.slice(chunkLength)
        remainingWidth -= chunkLength
      }
    })

    if (currentLine.length > 0) {
      wrappedLines.push(currentLine)
    }

    return wrappedLines.length > 0 ? wrappedLines : [[{ text: '' }]]
  }

  private copyCommandToClipboard(command: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(command).catch(() => undefined)
    }
  }

  private resolveCopyCommandAction(terminal: Terminal, bufferLineNumber: number): (() => void) | undefined {
    const contextLines = Array.from({ length: TerminalShellActionsAddon.LOOKBACK_LINE_COUNT }, (_, index) =>
      terminal.buffer.active.getLine(bufferLineNumber - 2 - index)?.translateToString(false)
    )
      .filter((line): line is string => Boolean(line))
      .join(' ')

    if (contextLines.includes(TerminalShellActionsAddon.SECOND_COMMAND_TITLE)) {
      return () => this.copyCommandToClipboard(this.getPortForwardCommand())
    }

    if (contextLines.includes(TerminalShellActionsAddon.FIRST_COMMAND_TITLE)) {
      return () => this.copyCommandToClipboard(this.getShellCommand())
    }

    return undefined
  }

  // draws the banner on the terminal
  private writeBanner(terminal: Terminal): void {
    const horizontalPadding = 1
    const maxContentWidth = Math.max(1, terminal.cols - 4 - horizontalPadding * 2)
    const bannerTitle: TerminalBannerSegment = {
      bold: true,
      text: 'Connect from your local terminal via the Qovery CLI',
    }

    const firstCommandLine: TerminalBannerSegment[] = [
      { bold: true, color: this.colors.warning, text: TerminalShellActionsAddon.FIRST_COMMAND_TITLE },
    ]

    const secondCommandLine: TerminalBannerSegment[] = [
      { bold: true, color: this.colors.warning, text: TerminalShellActionsAddon.SECOND_COMMAND_TITLE },
    ]

    const bannerLines: TerminalBannerSegment[][] = [
      firstCommandLine,
      [{ color: this.colors.subtle, text: 'Open an interactive shell inside a running container' }],
      [{ text: TerminalShellActionsAddon.COPY_COMMAND_LABEL }],
      [{ text: '' }],
      secondCommandLine,
      [{ color: this.colors.subtle, text: 'Forward a pod port to localhost' }],
      [{ text: TerminalShellActionsAddon.COPY_COMMAND_LABEL }],
    ]

    const maxBannerLineLength = Math.max(
      bannerTitle.text.length,
      ...bannerLines.map((segments) => segments.reduce((length, segment) => length + segment.text.length, 0))
    )
    const additionalContentWidth = 8
    const bannerContentWidth = Math.min(Math.max(20, maxBannerLineLength + additionalContentWidth), maxContentWidth)
    const bannerInnerWidth = bannerContentWidth + horizontalPadding * 2
    const lineContentWidth = bannerInnerWidth + 2
    const formatBannerLine = (segments: TerminalBannerSegment[]) => {
      const { clippedSegments, trailingPadding } = this.clampSegments(segments, bannerContentWidth)
      const styledText = clippedSegments.map((segment) => this.formatSegment(segment)).join('') + trailingPadding

      return `│ ${' '.repeat(horizontalPadding)}${styledText}${' '.repeat(horizontalPadding)} │`
    }

    const leftTitleLineWidth = 1
    const minimumRightTitleLineWidth = 1
    const maxVisibleTitleLength = Math.max(0, lineContentWidth - leftTitleLineWidth - minimumRightTitleLineWidth - 2)
    const visibleTitle = bannerTitle.text.slice(0, maxVisibleTitleLength)
    const rightTitleLineWidth = Math.max(
      minimumRightTitleLineWidth,
      lineContentWidth - leftTitleLineWidth - visibleTitle.length - 2
    )
    const styledTitle = this.formatSegment({
      ...bannerTitle,
      text: visibleTitle,
    })

    terminal.writeln(`┌${'─'.repeat(leftTitleLineWidth)} ${styledTitle} ${'─'.repeat(rightTitleLineWidth)}┐`)
    terminal.writeln(formatBannerLine([{ text: '' }]))
    bannerLines.forEach((line) => {
      this.wrapSegments(line, bannerContentWidth).forEach((wrappedLine) => {
        terminal.writeln(formatBannerLine(wrappedLine))
      })
    })
    terminal.writeln(formatBannerLine([{ text: '' }]))
    terminal.writeln(`└${'─'.repeat(lineContentWidth)}┘`)
    terminal.writeln('')
  }

  activate(terminal: Terminal): void {
    if (this.shouldWriteBanner) {
      const renderWhenFitIsStable = () => {
        if (this.bannerRenderTimeoutId) {
          clearTimeout(this.bannerRenderTimeoutId)
        }

        this.bannerRenderTimeoutId = setTimeout(() => {
          if (this.hasRenderedBanner) {
            return
          }

          this.fitAddon.fit()
          this.writeBanner(terminal)
          this.hasRenderedBanner = true
          this.resizeDisposable?.dispose()
          this.resizeDisposable = undefined
        }, 120)
      }

      this.resizeDisposable = terminal.onResize(() => {
        renderWhenFitIsStable()
      })
      renderWhenFitIsStable()
    }

    this.linkProviderDisposable = terminal.registerLinkProvider({
      provideLinks: (bufferLineNumber, callback) => {
        const line = terminal.buffer.active.getLine(bufferLineNumber - 1)

        if (!line) {
          callback(undefined)
          return
        }

        const lineText = line.translateToString(false)
        const linkRanges = []
        let fromIndex = 0

        while (fromIndex < lineText.length) {
          const labelIndex = lineText.indexOf(TerminalShellActionsAddon.COPY_COMMAND_LABEL, fromIndex)
          if (labelIndex === -1) {
            break
          }

          const action = this.resolveCopyCommandAction(terminal, bufferLineNumber)
          if (action) {
            linkRanges.push({
              activate: () => action(),
              decorations: {
                pointerCursor: true,
                underline: false,
              },
              range: {
                end: {
                  x: labelIndex + TerminalShellActionsAddon.COPY_COMMAND_LABEL.length + 1,
                  y: bufferLineNumber,
                },
                start: {
                  x: labelIndex + 1,
                  y: bufferLineNumber,
                },
              },
              text: TerminalShellActionsAddon.COPY_COMMAND_LABEL,
            })
          }

          fromIndex = labelIndex + TerminalShellActionsAddon.COPY_COMMAND_LABEL.length
        }

        callback(linkRanges.length > 0 ? linkRanges : undefined)
      },
    })
  }

  dispose(): void {
    if (this.bannerRenderTimeoutId) {
      clearTimeout(this.bannerRenderTimeoutId)
      this.bannerRenderTimeoutId = undefined
    }

    this.linkProviderDisposable?.dispose()
    this.resizeDisposable?.dispose()
    this.linkProviderDisposable = undefined
    this.resizeDisposable = undefined
  }
}

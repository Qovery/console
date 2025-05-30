import { CopyToClipboardButtonIcon } from '@qovery/shared/ui'
import { isValidElement } from 'react'
import type { FC, HTMLAttributes } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { MermaidChart } from '../mermaid-chart/mermaid-chart'

type CodeProps = {
  inline?: boolean
  className?: string
  children?: React.ReactNode
}

type Props = HTMLAttributes<HTMLDivElement> & {
  children: string
}

export const CopilotMarkdown: FC<Props> = ({ children, ...props }) => (
  <Markdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({ node, ...props }) => <h1 className="my-3 text-2xl font-bold" {...props} />,
      h2: ({ node, ...props }) => <h2 className="my-3 text-xl font-semibold" {...props} />,
      h3: ({ node, ...props }) => <h3 className="my-2 text-lg font-medium" {...props} />,
      h4: ({ node, ...props }) => <h4 className="my-2 text-base font-medium" {...props} />,
      p: ({ node, ...props }) => <p className="my-3 leading-relaxed" {...props} />,
      ul: ({ node, ...props }) => <ul className="my-3 list-disc space-y-1 pl-6" {...props} />,
      ol: ({ node, ...props }) => <ol className="my-3 list-decimal space-y-1 pl-6" {...props} />,
      li: ({ node, ...props }) => <li className="my-1" {...props} />,
      a: ({ node, ...props }) => (
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 transition-colors hover:text-blue-800 hover:underline"
          {...props}
        />
      ),
      pre: ({ node, children, ...props }) => {
        const codeContent = isValidElement(children)
          ? (children.props as { children?: string })?.children
          : null

        return (
          <div className="relative my-4">
            <pre
              className="w-full whitespace-pre-wrap rounded bg-neutral-100 p-4 font-code text-ssm dark:bg-neutral-800"
              {...props}
            >
              {children}
            </pre>
            {typeof codeContent === 'string' && (
              <div className="absolute flex items-center justify-center right-2 top-2 w-8 h-8 rounded-md border border-neutral-300 bg-white p-1 shadow-md dark:border-neutral-600 dark:bg-neutral-900">
                <CopyToClipboardButtonIcon
                  content={codeContent}
                  tooltipContent="Copy code"
                  className="text-neutral-400 hover:text-neutral-600 dark:text-white"
                />
              </div>
            )}
          </div>
        )
      },
      code: ({ inline, className, children, ...props }: CodeProps) => {
        const match = /language-(\w+)/.exec(className || '')
        if (match && match[1] === 'mermaid') {
          return <MermaidChart code={String(children).replace(/\n$/, '')} />
        }

        const isInline = inline ?? (typeof children === 'string' && !/\n/.test(children as string))
        if (isInline) {
          return (
            <code
              className="rounded border border-yellow-200 bg-yellow-50 px-1 py-0.5 font-mono text-[13px] text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
              {...props}
            >
              {children}
            </code>
          )
        }

        if (match) {
          return (
            <SyntaxHighlighter
              language={match[1]}
              style={materialDark as any}
              PreTag="div"
              customStyle={{
                borderRadius: '0.5rem',
                padding: '1rem',
                fontSize: '0.875rem',
                lineHeight: '1.5',
              }
              }
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          )
        }

        return (
          <code className="font-mono text-sm" {...props}>
            {children}
          </code>
        )
      },
      blockquote: ({ node, ...props }) => (
        <blockquote className="my-4 border-l-4 border-gray-300 pl-4 italic dark:border-gray-600" {...props} />
      ),
      table: ({ node, ...props }) => (
        <div className="my-6 w-full overflow-x-auto" >
          <table className="w-full border-collapse text-sm" {...props} />
        </div>
      ),
      thead: ({ node, ...props }) => <thead className="bg-neutral-100 dark:bg-neutral-700" {...props} />,
      tbody: ({ node, ...props }) => <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600" {...props} />,
      tr: ({ node, ...props }) => <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50" {...props} />,
      th: ({ node, ...props }) => (
        <th className="border border-neutral-200 px-4 py-2 text-left font-medium dark:border-neutral-600" {...props} />
      ),
      td: ({ node, ...props }) => (
        <td className="border border-neutral-200 px-4 py-2 dark:border-neutral-600" {...props} />
      ),
    }}
    {...props}
  >
    {children}
  </Markdown>
)
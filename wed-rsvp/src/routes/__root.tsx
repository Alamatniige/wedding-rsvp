import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { siteMeta } from '../data/weddingData'
import { getWeddingMode  } from '../lib/wedding-mode'
import type {WeddingMode} from '../lib/wedding-mode';

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  beforeLoad: async () => {
    const result = await getWeddingMode()
    return {
      weddingMode: result.mode,
      weddingModeOverridden: result.overridden,
    }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: siteMeta.title,
      },
      {
        name: 'description',
        content: siteMeta.description,
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
  notFoundComponent: RootNotFound,
})

function RootLayout() {
  const { weddingMode, weddingModeOverridden } = Route.useRouteContext()

  return (
    <>
      <Outlet />
      {weddingModeOverridden ? <DevModeBanner mode={weddingMode} /> : null}
    </>
  )
}

function DevModeBanner({ mode }: { mode: WeddingMode }) {
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        bottom: '12px',
        left: '12px',
        zIndex: 9999,
        padding: '6px 10px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '11px',
        lineHeight: 1.3,
        color: '#1a1a1a',
        background: '#f5e6a3',
        border: '1px solid #c4a84a',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        pointerEvents: 'none',
      }}
    >
      DEV mode: {mode}
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function RootNotFound() {
  return <p>Not Found</p>
}

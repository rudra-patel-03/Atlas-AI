import type { Metadata } from 'next'
import './globals.css'
import { ViewModeProvider } from '@/context/ViewModeContext'
import { ViewModeWrapper } from '@/components/layout/ViewModeWrapper'

export const metadata: Metadata = {
  title: 'ATLAS AI — Chat. Create. Code. Learn.',
  description: 'Your intelligent AI workspace for learning, coding, creating, researching, and everyday productivity. Powered by next-gen neural models.',
  icons: {
    icon: '/assets/logo.jpg',
    apple: '/assets/logo.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('atlas_theme') || 'dark';
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = stored === 'dark' || (stored === 'system' && systemDark);
                  var root = document.documentElement;
                  if (isDark) {
                    root.classList.add('dark');
                    root.classList.remove('light');
                  } else {
                    root.classList.remove('dark');
                    root.classList.add('light');
                  }
                  root.setAttribute('data-theme', stored);

                  var viewMode = localStorage.getItem('atlas_view_mode') || 'web';
                  root.setAttribute('data-view-mode', viewMode);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-atlas-950 text-slate-100 min-h-screen selection:bg-blue-600 selection:text-white antialiased">
        <ViewModeProvider>
          <ViewModeWrapper>
            {children}
          </ViewModeWrapper>
        </ViewModeProvider>
      </body>
    </html>
  )
}

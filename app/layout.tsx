import React from 'react'

export const metadata = {
  title: 'CHARGESPOT 內部短網址管理系統',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-50 text-gray-900 font-sans antialiased">{children}</body>
    </html>
  )
}

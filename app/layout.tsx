import React from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <head>
        <title>CHARGESPOT 短網址系統</title>
        <meta name="description" content="CHARGESPOT 內部專用短網址管理後台" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">{children}</body>
    </html>
  )
}

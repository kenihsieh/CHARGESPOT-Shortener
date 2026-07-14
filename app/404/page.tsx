import React from 'react'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-gray-50">
      <div className="max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <span className="text-6xl mb-4 block">🔍</span>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">找不到此短網址</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          請檢查輸入的網址代碼是否有誤，或該連結已被管理員刪除。
        </p>
        <a href="https://www.charge-spot.tw/" className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-colors">
          返回 CHARGESPOT 官網
        </a>
      </div>
    </div>
  )
}

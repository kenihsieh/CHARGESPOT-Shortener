import React from 'react'

export default function ExpiredPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-gray-50">
      <div className="max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">CHARGE SPOT</h1>
        <div className="w-16 h-1 bg-yellow-400 mx-auto mb-6"></div>
        <p className="text-xl text-red-500 font-bold mb-2">⏰ 此活動連結已過期</p>
        <p className="text-gray-500 text-sm leading-relaxed">
          抱歉，您所存取的專案或行銷活動已超過設定的有效期限。<br />
          請密切關注 CHARGESPOT 官方網站以獲取最新活動資訊！
        </p>
      </div>
    </div>
  )
}

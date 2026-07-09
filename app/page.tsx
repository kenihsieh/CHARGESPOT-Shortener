'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { QRCodeSVG } from 'qrcode.react'
import { Link2, Plus, Copy, Check, Power, AlertTriangle, Eye, Download } from 'lucide-react'

// 初始化 Supabase 客戶端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function Dashboard() {
  // 狀態管理
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [links, setLinks] = useState<any[]>([])
  
  // 表單狀態
  const [originalUrl, setOriginalUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [expireAt, setExpireAt] = useState('')
  const [notes, setNotes] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [copiedId, setCopiedId] = useState('')

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://go.charge-spot.tw'

  // 1. 簡單登入驗證（限制內部 Domain）
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.endsWith('@charge-spot.tw') && !email.endsWith('@chargespot.com')) {
      setErrorMsg('僅允許 CHARGESPOT 內部員工登入！')
      return
    }
    if (password === 'chargespot2026') { // 預設內部統一密碼，你可以自行修改
      setIsLoggedIn(true)
      setErrorMsg('')
      fetchLinks()
    } else {
      setErrorMsg('密碼錯誤')
    }
  }

  // 2. 抓取所有短網址列表
  const fetchLinks = async () => {
    const { data, error } = await supabase.from('links').select('*').order('created_at', { ascending: false })
    if (!error && data) setLinks(data)
  }

  // 3. 建立短網址
  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!originalUrl) {
      setErrorMsg('請填寫原始網址！')
      return
    }

    // 保留字檢查
    if (['admin', 'login', 'api', 'expired', '404'].includes(customCode.toLowerCase())) {
      setErrorMsg('此短網址代碼為系統保留字，不可使用。')
      return
    }

    const { data, error } = await supabase.from('links').insert([
      {
        short_code: customCode || null, // 留空會觸發我們寫在 Supabase 的自動日期規則
        original_url: originalUrl,
        created_by: email,
        expire_at: expireAt ? new Date(expireAt).toISOString() : null,
        notes: notes || null,
        status: 'active'
      }
    ]).select()

    if (error) {
      if (error.message.includes('unique')) {
        setErrorMsg('此自訂短網址已被使用。')
      } else {
        setErrorMsg('建立失敗：' + error.message)
      }
    } else {
      setOriginalUrl('')
      setCustomCode('')
      setExpireAt('')
      setNotes('')
      fetchLinks()
    }
  }

  // 4. 切換狀態（啟用/停用）
  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active'
    await supabase.from('links').update({ status: nextStatus }).eq('id', id)
    fetchLinks()
  }

  // 5. 複製網址功能
  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(`${baseUrl}/${code}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(''), 2000)
  }

  // 6. 下載 QR Code (SVG)
  const downloadQR = (code: string) => {
    const svg = document.getElementById(`qr-${code}`)
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)
      const downloadLink = document.createElement('a')
      downloadLink.href = svgUrl
      downloadLink.download = `QR_${code}.svg`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  // 未登入畫面
  if (!isLoggedIn) {
    return (
      <div class="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div class="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-black tracking-wider text-yellow-400">CHARGE SPOT</h1>
            <p class="text-sm text-gray-400 mt-1">內部短網址管理系統</p>
          </div>
          <form onSubmit={handleLogin} class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-400 uppercase mb-1">公司 Email</label>
              <input type="email" placeholder="username@charge-spot.tw" value={email} onChange={e => setEmail(e.target.value)} class="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-400 uppercase mb-1">系統密碼</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} class="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 text-sm" required />
            </div>
            {errorMsg && <div class="p-3 bg-red-950/50 border border-red-500/30 text-red-400 text-xs rounded-lg">{errorMsg}</div>}
            <button type="submit" class="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors text-sm">安全登入</button>
          </form>
        </div>
      </div>
    )
  }

  // 已登入 Dashboard 畫面
  return (
    <div class="min-h-screen bg-gray-50 pb-12">
      {/* 導航列 */}
      <header class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <span class="text-xl font-black tracking-tight text-gray-900">CHARGE<span class="text-yellow-500">SPOT</span></span>
            <span class="text-xs px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded-md font-medium">內部後台</span>
          </div>
          <div class="text-sm text-gray-500 flex items-center space-x-4">
            <span>使用者：{email}</span>
            <button onClick={() => setIsLoggedIn(false)} class="text-xs text-red-500 hover:underline">登出</button>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左側：建立短網址表單 */}
        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 class="text-base font-bold text-gray-900 mb-4 flex items-center"><Plus class="w-4 h-4 mr-1.5 text-yellow-500" /> 建立新短網址</h2>
          <form onSubmit={handleCreateLink} class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">原始長網址 (Long URL) *</label>
              <input type="url" placeholder="https://www.chargespot.com/tw/campaign/..." value={originalUrl} onChange={e => setOriginalUrl(e.target.value)} class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-yellow-500" required />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">自訂短網址代碼 (留空則自動生成當天日期)</label>
              <div class="flex items-center border border-gray-300 rounded-md bg-gray-50 px-3">
                <span class="text-sm text-gray-400 mr-1 select-none">go.cstw.tw/</span>
                <input type="text" placeholder="例如: summer" value={customCode} onChange={e => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9\-_]/g, ''))} class="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">到期日 (可選)</label>
              <input type="date" value={expireAt} onChange={e => setExpireAt(e.target.value)} class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">備註資訊 (例如：2026 夏季活動)</label>
              <input type="text" placeholder="輸入備註說明..." value={notes} onChange={e => setNotes(e.target.value)} class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-yellow-500" />
            </div>
            {errorMsg && <div class="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-md font-medium">{errorMsg}</div>}
            <button type="submit" class="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-md transition-colors text-sm">生成短網址</button>
          </form>
        </div>

        {/* 右側：短網址數據列表 */}
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 class="text-base font-bold text-gray-900 flex items-center"><Link2 class="w-4 h-4 mr-1.5 text-gray-500" /> 所有短網址管理</h2>
            <span class="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-semibold">共 {links.length} 筆資料</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-sm">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 tracking-wider">
                  <th class="px-6 py-3">短網址 / QR</th>
                  <th class="px-6 py-3">原始目標網址</th>
                  <th class="px-6 py-3 text-center">點擊數據</th>
                  <th class="px-6 py-3">狀態/到期日</th>
                  <th class="px-6 py-3 text-right">操作項目</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                {links.map((link) => {
                  const isLinkExpired = link.expire_at && new Date(link.expire_at) < new Date()
                  return (
                    <tr key={link.id} class="hover:bg-gray-50/80 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center space-x-3">
                          <div class="p-1 bg-white border border-gray-200 rounded shadow-sm">
                            <QRCodeSVG id={`qr-${link.short_code}`} value={`${baseUrl}/${link.short_code}`} size={36} />
                          </div>
                          <div>
                            <span class="font-bold text-gray-900 block select-all">/{link.short_code}</span>
                            <span class="text-xs text-gray-400 block max-w-[120px] truncate">{link.notes || '無備註'}</span>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 max-w-[200px]">
                        <span class="text-gray-600 break-all text-xs block line-clamp-2" title={link.original_url}>
                          {link.original_url}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span class="text-base font-extrabold text-gray-900">{link.click_count || 0}</span>
                        <span class="text-[10px] text-gray-400 block">Total Clicks</span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="space-y-1">
                          {link.status === 'disabled' ? (
                            <span class="inline-flex items-center text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded font-bold">已停用</span>
                          ) : isLinkExpired ? (
                            <span class="inline-flex items-center text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded font-bold">已過期</span>
                          ) : (
                            <span class="inline-flex items-center text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded font-bold">投遞中</span>
                          )}
                          <span class="text-[10px] text-gray-400 block">
                            {link.expire_at ? `至 ${new Date(link.expire_at).toLocaleDateString()}` : '永久有效'}
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end space-x-2">
                          <button onClick={() => copyToClipboard(link.short_code, link.id)} class="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors" title="複製短連結">
                            {copiedId === link.id ? <Check class="w-4 h-4 text-green-600" /> : <Copy class="w-4 h-4" />}
                          </button>
                          <button onClick={() => downloadQR(link.short_code)} class="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors" title="下載 SVG QR Code">
                            <Download class="w-4 h-4" />
                          </button>
                          <button onClick={() => toggleStatus(link.id, link.status)} class={`p-1.5 rounded transition-colors ${link.status === 'active' ? 'hover:bg-red-50 text-gray-400 hover:text-red-500' : 'hover:bg-green-50 text-gray-400 hover:text-green-600'}`} title={link.status === 'active' ? '點擊停用' : '點擊啟用'}>
                            <Power class="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {links.length === 0 && (
                  <tr>
                    <td colSpan={5} class="text-center py-12 text-gray-400 text-xs">目前尚無任何短網址資料，請由左側建立。</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

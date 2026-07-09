'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Link2, Plus, Trash2, ExternalLink, BarChart3, Copy, Check, LogIn, Key, Loader2, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

// 初始化 Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const BASE_URL = process.env.NEXT_PUBLIC_SHORT_LINK_BASE_URL || 'https://go.charge-spot.tw'

interface LinkItem {
  id: string
  short_code: string
  original_url: string
  created_by: string
  created_at: string
  expire_at: string | null
  click_count: number
  notes: string | null
}

export default function AdminDashboard() {
  // 登入狀態
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // 資料狀態
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>()

  // 表單狀態
  const [originalUrl, setOriginalUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [createdBy, setCreatedBy] = useState('')
  const [expireDays, setExpireDays] = useState('30')
  const [notes, setNotes] = useState('')

  // QR Code 彈窗狀態
  const [activeQrUrl, setActiveQrUrl] = useState<string | null>(null)

  // 驗證登入密碼
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'chargespot888') {
      setIsLoggedIn(true)
      setLoginError('')
    } else {
      setLoginError('密碼錯誤，請重新輸入')
    }
  }

  // 取得資料列表
  const fetchLinks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLinks(data || [])
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchLinks()
    }
  }, [isLoggedIn])

  // 建立短網址
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!originalUrl || !createdBy) return

    try {
      setSubmitting(true)
      
      let expireDate = null
      if (expireDays !== 'never') {
        const d = new Date()
        d.setDate(d.getDate() + parseInt(expireDays))
        expireDate = d.toISOString()
      }

      const { error } = await supabase.from('links').insert([
        {
          original_url: originalUrl,
          short_code: customCode.trim() || null,
          created_by: createdBy,
          expire_at: expireDate,
          notes: notes || null
        }
      ])

      if (error) {
        alert('建立失敗：' + error.message)
      } else {
        setOriginalUrl('')
        setCustomCode('')
        setNotes('')
        fetchLinks()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  // 刪除短網址
  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此短網址嗎？')) return
    try {
      const { error } = await supabase.from('links').delete().eq('id', id)
      if (error) alert('刪除失敗')
      else fetchLinks()
    } catch (err) {
      console.error(err)
    }
  }

  // 複製功能
  const copyToClipboard = (code: string) => {
    const fullUrl = `${BASE_URL}/${code}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black tracking-wider text-yellow-400">CHARGE SPOT</h1>
            <p className="text-gray-400 text-sm mt-1">短網址管理系統後台</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">管理員密碼</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="password"
                  placeholder="請輸入密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:border-yellow-400 text-white text-sm"
                />
              </div>
              {loginError && <p className="text-red-400 text-xs mt-2">{loginError}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
            >
              <LogIn size={16} />
              登入系統
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 頂部標題 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-800 pb-5 gap-4">
          <div>
            <h1 className="text-2xl font-black text-yellow-400 tracking-wider">CHARGE SPOT 短網址後台</h1>
            <p className="text-gray-400 text-sm mt-1">快速建立行銷代碼與追蹤點擊數據</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-950 text-green-400 border border-green-800 rounded-full text-xs font-medium">系統已連線</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：新增表單 */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-fit space-y-5 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 text-white">
              <Plus size={18} className="text-yellow-400" />
              建立新短連結
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">原始目標網址 (必填)</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/very/long/url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">自訂後綴代碼 (選填，留空自動生成當天日期)</label>
                <input
                  type="text"
                  placeholder="例如: sp2026"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">建立人 (必填，如: Keni)</label>
                <input
                  type="text"
                  required
                  placeholder="請輸入您的名字"
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">有效期限</label>
                <select
                  value={expireDays}
                  onChange={(e) => setExpireDays(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
                >
                  <option value="7">7 天</option>
                  <option value="30">30 天</option>
                  <option value="90">90 天</option>
                  <option value="never">永久有效</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">備註說明 (選填)</label>
                <textarea
                  placeholder="此連結用途用途說明..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-700 text-gray-950 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
                產生短網址連結
              </button>
            </form>
          </div>

          {/* 右側：資料清單 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-yellow-400" />
                所有短網址列表 ({links.length})
              </h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
                <Loader2 size={32} className="animate-spin text-yellow-400 mb-2" />
                <p className="text-gray-400 text-sm">載入資料庫中...</p>
              </div>
            ) : links.length === 0 ? (
              <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl text-gray-500 text-sm">
                目前沒有任何短網址資料，開始建立一個吧！
              </div>
            ) : (
              <div className="space-y-4">
                {links.map((item) => (
                  <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors space-y-3 relative overflow-hidden group">
                    
                    {/* 點擊數徽章 */}
                    <div className="absolute top-0 right-0 bg-gray-800 border-l border-b border-gray-700 px-3 py-1 rounded-bl-xl flex items-center gap-1 text-xs font-semibold text-yellow-400">
                      <span>點擊次數:</span>
                      <span className="text-sm font-black">{item.click_count}</span>
                    </div>

                    {/* 短網址標題列 */}
                    <div className="flex items-center gap-2 max-w-[80%]">
                      <span className="text-base font-bold text-white tracking-wide">
                        {item.short_code}
                      </span>
                      <button
                        onClick={() => copyToClipboard(item.short_code)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                        title="複製短網址"
                      >
                        {copiedCode === item.short_code ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => setActiveQrUrl(`${BASE_URL}/${item.short_code}`)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                        title="查看 QR Code"
                      >
                        <QrCode size={14} />
                      </button>
                    </div>

                    {/* 原始長網址與備註 */}
                    <div className="space-y-1">
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <span className="font-semibold text-gray-500">原始網址:</span>
                        <a
                          href={item.original_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline truncate max-w-[90%] inline-flex items-center gap-0.5"
                        >
                          {item.original_url}
                          <ExternalLink size={10} />
                        </a>
                      </div>
                      {item.notes && (
                        <div className="text-xs text-gray-400">
                          <span className="font-semibold text-gray-500">說明:</span> {item.notes}
                        </div>
                      )}
                    </div>

                    {/* 底部資訊列 */}
                    <div className="flex items-center justify-between border-t border-gray-800 pt-3 text-[11px] text-gray-500">
                      <div className="flex gap-4">
                        <span>建立者: <strong className="text-gray-300">{item.created_by}</strong></span>
                        <span>日期: {new Date(item.created_at).toLocaleDateString()}</span>
                        <span>
                          到期日:{' '}
                          {item.expire_at ? (
                            <span className={new Date(item.expire_at) < new Date() ? 'text-red-400 font-medium' : 'text-gray-400'}>
                              {new Date(item.expire_at).toLocaleDateString()}
                            </span>
                          ) : (
                            '永久有效'
                          )}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                        title="刪除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code 燈箱彈窗 */}
      {activeQrUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl max-w-xs w-full text-center space-y-4 shadow-2xl relative">
            <h3 className="text-gray-900 font-bold text-sm truncate">{activeQrUrl}</h3>
            <div className="bg-gray-50 p-4 rounded-xl flex justify-center">
              <QRCodeSVG value={activeQrUrl} size={180} level="H" />
            </div>
            <p className="text-xs text-gray-500">右鍵點擊或長按 QR Code 即可儲存下載</p>
            <button
              onClick={() => setActiveQrUrl(null)}
              className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs rounded-xl transition-colors"
            >
              關閉視窗
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

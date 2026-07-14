'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const cleanUrl = supabaseUrl?.replace(/\/+$/, '')
const supabase = createClient(cleanUrl || '', supabaseAnonKey || '')

// 畫面顯示的短網址前綴
const BASE_SHORT_URL = 'https://go.charge-spot.tw/'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [originalUrl, setOriginalUrl] = useState('')
  const [shortCode, setShortCode] = useState('')
  const [creator, setCreator] = useState('')
  const [urls, setUrls] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoggedIn) {
      fetchUrls()
    }
  }, [isLoggedIn])

  const fetchUrls = async () => {
    const { data } = await supabase
      .from('urls')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setUrls(data)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'chargespot888') {
      setIsLoggedIn(true)
    } else {
      alert('密碼錯誤！')
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!originalUrl || !shortCode || !creator) {
      alert('請填寫所有欄位！')
      return
    }

    setLoading(true)

    // 自動補全網址協議頭的防呆
    let finalOriginalUrl = originalUrl.trim()
    if (!/^https?:\/\//i.test(finalOriginalUrl)) {
      finalOriginalUrl = 'https://' + finalOriginalUrl
    }

    // 檢查代碼是否重複
    const { data: existing } = await supabase
      .from('urls')
      .select('id')
      .eq('short_code', shortCode.trim().toLowerCase())
      .maybeSingle()

    if (existing) {
      alert('此短網址代碼已被佔用，請換一個！')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('urls').insert([
      {
        original_url: finalOriginalUrl,
        short_code: shortCode.trim().toLowerCase(),
        creator: creator.trim(),
      },
    ])

    setLoading(false)

    if (error) {
      alert('建立失敗：' + error.message)
    } else {
      alert('短網址建立成功！')
      setOriginalUrl('')
      setShortCode('')
      fetchUrls()
    }
  }

  if (!isLoggedIn) {
    return (
      <div style={{ backgroundColor: '#111827', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
        <div style={{ backgroundColor: '#1f2937', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px', border: '1px solid #374151' }}>
          <h1 style={{ color: '#facc15', textAlign: 'center', fontSize: '28px', marginBottom: '8px', fontWeight: 'bold' }}>CHARGE SPOT</h1>
          <p style={{ color: '#9ca3af', textAlign: 'center', fontSize: '14px', marginBottom: '32px' }}>短網址管理系統後台</p>
          <form onSubmit={handleLogin}>
            <label style={{ color: '#d1d5db', fontSize: '14px', display: 'block', marginBottom: '8px' }}>管理員密碼</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="請輸入密碼" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #4b5563', backgroundColor: '#111827', color: '#fff', boxSizing: 'border-box', marginBottom: '24px' }} />
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#facc15', color: '#111827', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>登入系統</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ color: '#facc15', fontSize: '28px', fontWeight: 'bold' }}>CHARGE SPOT 短網址後台</h1>
          </div>
          <button onClick={() => setIsLoggedIn(false)} style={{ background: 'none', border: '1px solid #475569', color: '#94a3b8', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>登出</button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h2 style={{ fontSize: '18px', color: '#facc15', marginTop: 0, marginBottom: '20px' }}>✨ 建立新短網址</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>原始目標長網址</label>
                <input type="text" value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} placeholder="請貼上長網址..." style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>自訂短網址代碼</label>
                  <input type="text" value={shortCode} onChange={(e) => setShortCode(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))} placeholder="例如: test" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>建立人</label>
                  <input type="text" value={creator} onChange={(e) => setCreator(e.target.value)} placeholder="例如: Keni" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }} />
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ backgroundColor: '#facc15', color: '#0f172a', border: 'none', padding: '14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? '建立中...' : '🚀 產生短網址連結'}
              </button>
            </form>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ fontSize: '18px', color: '#facc15', marginTop: 0, marginBottom: '20px' }}>📋 已建立的短網址清單</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>短網址連結 (點擊複製)</th>
                    <th style={{ padding: '12px' }}>原始長網址</th>
                    <th style={{ padding: '12px' }}>建立人</th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((url) => {
                    const fullShortUrl = `${BASE_SHORT_URL}${url.short_code}`
                    return (
                      <tr key={url.id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '12px' }}>
                          <span onClick={() => { navigator.clipboard.writeText(fullShortUrl); alert('已複製：' + fullShortUrl); }} style={{ color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}>
                            {fullShortUrl}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#94a3b8', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <a href={url.original_url} target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>{url.original_url}</a>
                        </td>
                        <td style={{ padding: '12px' }}>{url.creator}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

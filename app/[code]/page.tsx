import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

// 把 Supabase 的初始化移到元件/函式內部，避免在打包（Build）時因為找不到環境變數而崩潰
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // 如果編譯時環境變數不存在，先回傳空物件，防止打包中斷
    return null
  }

  const cleanUrl = supabaseUrl.replace(/\/+$/, '')
  return createClient(cleanUrl, supabaseAnonKey)
}

interface PageProps {
  params: Promise<{ code: string }>
}

export default async function RedirectPage({ params }: PageProps) {
  const resolvedParams = await params
  const shortCode = resolvedParams.code?.toLowerCase()

  if (!shortCode) {
    redirect('/')
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    console.error('Supabase client failed to initialize')
    redirect('/')
  }

  // 至 Supabase 資料庫比對短網址代碼
  const { data } = await supabase
    .from('urls')
    .select('original_url')
    .eq('short_code', shortCode)
    .maybeSingle()

  if (data && data.original_url) {
    // 成功找到目標，執行 302 跳轉
    redirect(data.original_url)
  }

  // 找不到代碼則退回首頁
  redirect('/')
}

import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const cleanUrl = supabaseUrl?.replace(/\/+$/, '')
const supabase = createClient(cleanUrl || '', supabaseAnonKey || '')

interface PageProps {
  params: Promise<{ code: string }>
}

export default async function RedirectPage({ params }: PageProps) {
  const resolvedParams = await params
  const shortCode = resolvedParams.code?.toLowerCase()

  if (!shortCode) {
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

  // 找不到代碼則退回後台首頁
  redirect('/')
}

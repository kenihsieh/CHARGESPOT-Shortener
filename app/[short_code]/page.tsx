import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export default async function RedirectHandler({ params }: { params: { short_code: string } }) {
  // 注意：在 Next.js 14+ 中，動態參數需非同步獲取
  const { short_code } = await params

  // 1. 去資料庫查這個短網址
  const { data: link } = await supabase
    .from('links')
    .select('*')
    .eq('short_code', short_code)
    .single()

  // 2. 如果找不到，導向 404
  if (!link) {
    redirect('/404')
  }

  // 3. 檢查是否停用或過期
  const isExpired = link.expire_at && new Date(link.expire_at) < new Date()
  if (link.status === 'disabled' || isExpired) {
    redirect('/expired')
  }

  // 4. 計算點擊數 (直接把資料庫的 click_count 加 1)
  await supabase
    .from('links')
    .update({ click_count: (link.click_count || 0) + 1 })
    .eq('id', link.id)

  // 5. 使用 302 暫時轉址，完全不影響官網 SEO
  redirect(link.original_url)
}

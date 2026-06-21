import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await request.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Invalid form' }, { status: 400 })

  const file = form.get('file')
  const prefix = (form.get('prefix') as string | null) || 'photo'
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 })
  }
  const contentType = file.type || 'application/octet-stream'
  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ error: 'Unsupported type' }, { status: 400 })
  }

  const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg'
  const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'photo'
  const fileName = `${safePrefix}-${Date.now()}.${ext}`

  const arrayBuf = await file.arrayBuffer()
  const buf = Buffer.from(arrayBuf)

  const { error: upErr } = await supabaseAdmin.storage
    .from('photos')
    .upload(fileName, buf, { contentType, upsert: false })

  if (upErr) {
    console.error('upload error:', upErr.message)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const { data: { publicUrl } } = supabaseAdmin.storage.from('photos').getPublicUrl(fileName)
  return NextResponse.json({ url: publicUrl })
}

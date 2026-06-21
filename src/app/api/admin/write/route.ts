import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

const ALLOWED_TABLES = new Set([
  'cats',
  'weight_records',
  'health_records',
  'food_logs',
  'grooming_tasks',
  'grooming_logs',
  'litter_box_logs',
])
const ALLOWED_OPS = new Set(['insert', 'update', 'delete'])

type Body = {
  table?: unknown
  op?: unknown
  id?: unknown
  data?: unknown
  multi?: unknown
  returning?: unknown
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const table = typeof body.table === 'string' ? body.table : ''
  const op = typeof body.op === 'string' ? body.op : ''
  const id = typeof body.id === 'string' ? body.id : undefined
  const multi = body.multi === true
  const returning = body.returning !== false // default true

  if (!ALLOWED_TABLES.has(table)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
  }
  if (!ALLOWED_OPS.has(op)) {
    return NextResponse.json({ error: 'Invalid op' }, { status: 400 })
  }

  const client = supabaseAdmin.from(table)

  try {
    if (op === 'insert') {
      const payload = body.data
      if (!payload || typeof payload !== 'object') {
        return NextResponse.json({ error: 'Missing data' }, { status: 400 })
      }
      const q = client.insert(payload as object | object[])
      if (returning) {
        const res = multi ? await q.select() : await q.select().single()
        if (res.error) throw res.error
        return NextResponse.json({ data: res.data })
      } else {
        const res = await q
        if (res.error) throw res.error
        return NextResponse.json({ data: null })
      }
    }

    if (op === 'update') {
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
      const payload = body.data
      if (!payload || typeof payload !== 'object') {
        return NextResponse.json({ error: 'Missing data' }, { status: 400 })
      }
      const q = client.update(payload as object).eq('id', id)
      if (returning) {
        const res = await q.select().single()
        if (res.error) throw res.error
        return NextResponse.json({ data: res.data })
      } else {
        const res = await q
        if (res.error) throw res.error
        return NextResponse.json({ data: null })
      }
    }

    if (op === 'delete') {
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
      const res = await client.delete().eq('id', id)
      if (res.error) throw res.error
      return NextResponse.json({ data: null })
    }

    return NextResponse.json({ error: 'Unhandled op' }, { status: 400 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('admin/write error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { pin } = await request.json()
  const adminPin = process.env.ADMIN_PIN

  if (!adminPin) {
    return NextResponse.json({ error: 'Admin PIN not configured' }, { status: 500 })
  }

  if (String(pin).trim() === String(adminPin).trim()) {
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false }, { status: 401 })
}

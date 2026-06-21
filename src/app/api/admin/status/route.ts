import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const isAdmin = await isAdminRequest(request)
  return NextResponse.json({ isAdmin })
}

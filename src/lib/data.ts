import { supabase } from './supabase'
import type { Cat, WeightRecord, HealthRecord, FoodLog, GroomingTask, GroomingLog, LitterBoxLog } from './supabase'

// ── Internal: write proxy ──

async function adminWrite<T>(payload: {
  table: string
  op: 'insert' | 'update' | 'delete'
  id?: string
  data?: unknown
  multi?: boolean
  returning?: boolean
}): Promise<T> {
  const res = await fetch('/api/admin/write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || `Write failed (${res.status})`)
  return json.data as T
}

// ── Cats ──

export async function getCats(): Promise<Cat[]> {
  const { data, error } = await supabase
    .from('cats')
    .select('*')
    .order('name')
  if (error) { console.error('getCats:', error.message); return []; }
  return data ?? []
}

export async function updateCat(id: string, updates: { name?: string; breed?: string; color?: string; date_of_birth?: string | null; gender?: string | null; photo_url?: string | null }) {
  return adminWrite<Cat>({ table: 'cats', op: 'update', id, data: updates })
}

// ── Weight Records ──

export async function getWeightRecords(catId?: string, limit?: number): Promise<WeightRecord[]> {
  let query = supabase.from('weight_records').select('*').order('recorded_at', { ascending: true })
  if (catId) query = query.eq('cat_id', catId)
  query = query.limit(limit ?? 500)
  const { data, error } = await query
  if (error) { console.error('getWeightRecords:', error.message); return []; }
  return data ?? []
}

export async function addWeightRecord(record: { cat_id: string; weight_kg: number; recorded_at: string; notes?: string }) {
  return adminWrite<WeightRecord>({ table: 'weight_records', op: 'insert', data: record })
}

export async function updateWeightRecord(id: string, updates: {
  weight_kg?: number; recorded_at?: string; notes?: string | null;
}) {
  return adminWrite<WeightRecord>({ table: 'weight_records', op: 'update', id, data: updates })
}

export async function deleteWeightRecord(id: string) {
  await adminWrite<null>({ table: 'weight_records', op: 'delete', id, returning: false })
}

// ── Health Records ──

export async function getHealthRecords(catId?: string): Promise<HealthRecord[]> {
  let query = supabase.from('health_records').select('*').order('date', { ascending: false }).limit(500)
  if (catId) query = query.eq('cat_id', catId)
  const { data, error } = await query
  if (error) { console.error('getHealthRecords:', error.message); return []; }
  return data ?? []
}

export async function addHealthRecord(record: {
  cat_id: string; record_type: string; title: string;
  description?: string; date: string; next_due_date?: string; vet_name?: string; photo_url?: string;
}) {
  return adminWrite<HealthRecord>({ table: 'health_records', op: 'insert', data: record })
}

export async function addHealthRecords(records: {
  cat_id: string; record_type: string; title: string;
  description?: string; date: string; next_due_date?: string; vet_name?: string; photo_url?: string;
}[]) {
  return adminWrite<HealthRecord[]>({ table: 'health_records', op: 'insert', data: records, multi: true })
}

export async function updateHealthRecord(id: string, updates: {
  title?: string; description?: string | null; date?: string;
  next_due_date?: string | null; vet_name?: string | null; record_type?: string; photo_url?: string | null;
}) {
  return adminWrite<HealthRecord>({ table: 'health_records', op: 'update', id, data: updates })
}

export async function deleteHealthRecord(id: string) {
  await adminWrite<null>({ table: 'health_records', op: 'delete', id, returning: false })
}

// ── Food Logs ──

export async function getFoodLogs(date?: string, catId?: string, limit?: number): Promise<FoodLog[]> {
  let query = supabase.from('food_logs').select('*').order('created_at', { ascending: true })
  if (date) query = query.eq('date', date)
  if (catId) query = query.eq('cat_id', catId)
  query = query.limit(limit ?? 200)
  const { data, error } = await query
  if (error) { console.error('getFoodLogs:', error.message); return []; }
  return data ?? []
}

export async function addFoodLog(record: {
  cat_id: string; food_name: string; food_type: string;
  amount_grams?: number; meal_time: string; date: string; notes?: string;
}) {
  return adminWrite<FoodLog>({ table: 'food_logs', op: 'insert', data: record })
}

export async function updateFoodLog(id: string, updates: {
  food_name?: string; food_type?: string; amount_grams?: number | null;
  meal_time?: string; notes?: string | null; cat_id?: string;
}) {
  return adminWrite<FoodLog>({ table: 'food_logs', op: 'update', id, data: updates })
}

export async function deleteFoodLog(id: string) {
  await adminWrite<null>({ table: 'food_logs', op: 'delete', id, returning: false })
}

// ── Grooming Tasks ──

export async function getGroomingTasks(): Promise<GroomingTask[]> {
  const { data, error } = await supabase.from('grooming_tasks').select('*').order('sort_order')
  if (error) { console.error('getGroomingTasks:', error.message); return []; }
  return data ?? []
}

export async function addGroomingTask(task: { type: string; label: string; icon: string; frequency_days: number }) {
  const { data: maxOrder } = await supabase.from('grooming_tasks').select('sort_order').order('sort_order', { ascending: false }).limit(1)
  const nextOrder = (maxOrder?.[0]?.sort_order ?? -1) + 1
  return adminWrite<GroomingTask>({ table: 'grooming_tasks', op: 'insert', data: { ...task, sort_order: nextOrder } })
}

export async function updateGroomingTask(id: string, updates: { label?: string; icon?: string; frequency_days?: number }) {
  return adminWrite<GroomingTask>({ table: 'grooming_tasks', op: 'update', id, data: updates })
}

export async function deleteGroomingTask(id: string) {
  await adminWrite<null>({ table: 'grooming_tasks', op: 'delete', id, returning: false })
}

// ── Grooming Logs ──

export async function getGroomingLogs(catId?: string): Promise<GroomingLog[]> {
  let query = supabase.from('grooming_logs').select('*').order('completed_at', { ascending: false }).limit(300)
  if (catId) query = query.eq('cat_id', catId)
  const { data, error } = await query
  if (error) { console.error('getGroomingLogs:', error.message); return []; }
  return data ?? []
}

export async function addGroomingLog(record: { cat_id: string; task_type: string; completed_at: string; notes?: string }) {
  return adminWrite<GroomingLog>({ table: 'grooming_logs', op: 'insert', data: record })
}

export async function deleteGroomingLog(id: string) {
  await adminWrite<null>({ table: 'grooming_logs', op: 'delete', id, returning: false })
}

// ── Litter Box Logs ──

export async function getLitterBoxLogs(): Promise<LitterBoxLog[]> {
  const { data, error } = await supabase.from('litter_box_logs').select('*').order('created_at', { ascending: false }).limit(200)
  if (error) { console.error('getLitterBoxLogs:', error.message); return []; }
  return data ?? []
}

export async function addLitterBoxLog(record: {
  date: string; time?: string; photo_url?: string; notes?: string; ai_analysis?: string;
}) {
  return adminWrite<LitterBoxLog>({ table: 'litter_box_logs', op: 'insert', data: record })
}

export async function updateLitterBoxLog(id: string, updates: { ai_analysis?: string; photo_url?: string | null }) {
  return adminWrite<LitterBoxLog>({ table: 'litter_box_logs', op: 'update', id, data: updates })
}

export async function deleteLitterBoxLog(id: string) {
  await adminWrite<null>({ table: 'litter_box_logs', op: 'delete', id, returning: false })
}

// ── Photo upload (admin only) ──

export async function uploadPhoto(file: Blob, prefix = 'photo'): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('prefix', prefix)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: form, credentials: 'same-origin' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || `Upload failed (${res.status})`)
  return json.url as string
}

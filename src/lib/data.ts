import { supabase } from './supabase'
import type { Cat, WeightRecord, HealthRecord, FoodLog, Photo } from './supabase'

// ── Cats ──

export async function getCats(): Promise<Cat[]> {
  const { data, error } = await supabase
    .from('cats')
    .select('*')
    .order('name')
  if (error) { console.error('getCats:', error.message); return []; }
  return data ?? []
}

export async function updateCat(id: string, updates: { name?: string; breed?: string; color?: string; date_of_birth?: string | null; photo_url?: string | null }) {
  const { data, error } = await supabase.from('cats').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

// ── Weight Records ──

export async function getWeightRecords(catId?: string): Promise<WeightRecord[]> {
  let query = supabase.from('weight_records').select('*').order('recorded_at', { ascending: true })
  if (catId) query = query.eq('cat_id', catId)
  const { data, error } = await query
  if (error) { console.error('getWeightRecords:', error.message); return []; }
  return data ?? []
}

export async function addWeightRecord(record: { cat_id: string; weight_kg: number; recorded_at: string; notes?: string }) {
  const { data, error } = await supabase.from('weight_records').insert(record).select().single()
  if (error) throw error
  return data
}

export async function deleteWeightRecord(id: string) {
  const { error } = await supabase.from('weight_records').delete().eq('id', id)
  if (error) throw error
}

// ── Health Records ──

export async function getHealthRecords(catId?: string): Promise<HealthRecord[]> {
  let query = supabase.from('health_records').select('*').order('date', { ascending: false })
  if (catId) query = query.eq('cat_id', catId)
  const { data, error } = await query
  if (error) { console.error('getHealthRecords:', error.message); return []; }
  return data ?? []
}

export async function addHealthRecord(record: {
  cat_id: string; record_type: string; title: string;
  description?: string; date: string; next_due_date?: string;
}) {
  const { data, error } = await supabase.from('health_records').insert(record).select().single()
  if (error) throw error
  return data
}

export async function deleteHealthRecord(id: string) {
  const { error } = await supabase.from('health_records').delete().eq('id', id)
  if (error) throw error
}

// ── Food Logs ──

export async function getFoodLogs(date?: string, catId?: string): Promise<FoodLog[]> {
  let query = supabase.from('food_logs').select('*').order('created_at', { ascending: true })
  if (date) query = query.eq('date', date)
  if (catId) query = query.eq('cat_id', catId)
  const { data, error } = await query
  if (error) { console.error('getFoodLogs:', error.message); return []; }
  return data ?? []
}

export async function addFoodLog(record: {
  cat_id: string; food_name: string; food_type: string;
  amount_grams?: number; meal_time: string; date: string; notes?: string;
}) {
  const { data, error } = await supabase.from('food_logs').insert(record).select().single()
  if (error) throw error
  return data
}

export async function deleteFoodLog(id: string) {
  const { error } = await supabase.from('food_logs').delete().eq('id', id)
  if (error) throw error
}

// ── Photos ──

export async function getPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase.from('photos').select('*').order('created_at', { ascending: false })
  if (error) { console.error('getPhotos:', error.message); return []; }
  return data ?? []
}

export async function addPhoto(record: { cat_id?: string; url: string; caption?: string }) {
  const { data, error } = await supabase.from('photos').insert(record).select().single()
  if (error) throw error
  return data
}

export async function deletePhoto(id: string) {
  const { error } = await supabase.from('photos').delete().eq('id', id)
  if (error) throw error
}

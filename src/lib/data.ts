import { supabase } from './supabase'
import type { Cat, WeightRecord, HealthRecord, FoodLog, Photo, LitterBoxLog } from './supabase'

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

export async function updateWeightRecord(id: string, updates: {
  weight_kg?: number; recorded_at?: string; notes?: string | null;
}) {
  const { data, error } = await supabase.from('weight_records').update(updates).eq('id', id).select().single()
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
  description?: string; date: string; next_due_date?: string; vet_name?: string; photo_url?: string;
}) {
  const { data, error } = await supabase.from('health_records').insert(record).select().single()
  if (error) throw error
  return data
}

export async function addHealthRecords(records: {
  cat_id: string; record_type: string; title: string;
  description?: string; date: string; next_due_date?: string; vet_name?: string; photo_url?: string;
}[]) {
  const { data, error } = await supabase.from('health_records').insert(records).select()
  if (error) throw error
  return data
}

export async function updateHealthRecord(id: string, updates: {
  title?: string; description?: string | null; date?: string;
  next_due_date?: string | null; vet_name?: string | null; record_type?: string; photo_url?: string | null;
}) {
  const { data, error } = await supabase.from('health_records').update(updates).eq('id', id).select().single()
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

export async function updateFoodLog(id: string, updates: {
  food_name?: string; food_type?: string; amount_grams?: number | null;
  meal_time?: string; notes?: string | null; cat_id?: string;
}) {
  const { data, error } = await supabase.from('food_logs').update(updates).eq('id', id).select().single()
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

// ── Litter Box Logs ──

export async function getLitterBoxLogs(): Promise<LitterBoxLog[]> {
  const { data, error } = await supabase.from('litter_box_logs').select('*').order('created_at', { ascending: false })
  if (error) { console.error('getLitterBoxLogs:', error.message); return []; }
  return data ?? []
}

export async function addLitterBoxLog(record: {
  date: string; time?: string; photo_url?: string; notes?: string; ai_analysis?: string;
}) {
  const { data, error } = await supabase.from('litter_box_logs').insert(record).select().single()
  if (error) throw error
  return data
}

export async function updateLitterBoxLog(id: string, updates: { ai_analysis?: string }) {
  const { data, error } = await supabase.from('litter_box_logs').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteLitterBoxLog(id: string) {
  const { error } = await supabase.from('litter_box_logs').delete().eq('id', id)
  if (error) throw error
}

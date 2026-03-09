import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Cat = {
  id: string
  name: string
  breed: string
  color: string
  date_of_birth: string | null
  gender: string | null
  photo_url: string | null
  created_at: string
}

export type WeightRecord = {
  id: string
  cat_id: string
  weight_kg: number
  recorded_at: string
  notes: string | null
}

export type HealthRecord = {
  id: string
  cat_id: string
  record_type: 'vaccine' | 'deworm' | 'vet_visit' | 'medication' | 'other'
  title: string
  description: string | null
  date: string
  next_due_date: string | null
  vet_name: string | null
  photo_url: string | null
  created_at: string
}

export type Vet = {
  name: string
  area: string
  state: string
  maps_url: string
}

export type FoodLog = {
  id: string
  cat_id: string
  food_name: string
  food_type: string
  amount_grams: number | null
  meal_time: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  date: string
  notes: string | null
  created_at: string
}

export type GroomingLog = {
  id: string
  cat_id: string
  task_type: 'nail_cutting' | 'ear_cleaning' | 'teeth_brushing' | 'fur_brushing'
  completed_at: string
  notes: string | null
  created_at: string
}

export type LitterBoxLog = {
  id: string
  date: string
  time: string | null
  photo_url: string | null
  notes: string | null
  ai_analysis: string | null
  created_at: string
}

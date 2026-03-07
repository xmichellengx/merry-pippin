import type { Cat, WeightRecord, HealthRecord, FoodLog } from './supabase'

// Mock data for development / demo before Supabase is connected
export const mockCats: Cat[] = [
  {
    id: '1',
    name: 'Merry',
    breed: 'British Shorthair',
    color: 'Golden',
    date_of_birth: '2024-06-15',
    photo_url: null,
    created_at: '2024-06-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'Pippin',
    breed: 'British Shorthair',
    color: 'Golden',
    date_of_birth: '2024-06-15',
    photo_url: null,
    created_at: '2024-06-15T00:00:00Z',
  },
]

export const mockWeightRecords: WeightRecord[] = [
  { id: '1', cat_id: '1', weight_kg: 0.5, recorded_at: '2024-07-15', notes: null },
  { id: '2', cat_id: '1', weight_kg: 1.2, recorded_at: '2024-08-15', notes: null },
  { id: '3', cat_id: '1', weight_kg: 2.0, recorded_at: '2024-09-15', notes: null },
  { id: '4', cat_id: '1', weight_kg: 2.8, recorded_at: '2024-10-15', notes: null },
  { id: '5', cat_id: '1', weight_kg: 3.4, recorded_at: '2024-11-15', notes: null },
  { id: '6', cat_id: '1', weight_kg: 3.9, recorded_at: '2024-12-15', notes: null },
  { id: '7', cat_id: '1', weight_kg: 4.2, recorded_at: '2025-01-15', notes: null },
  { id: '8', cat_id: '1', weight_kg: 4.5, recorded_at: '2025-02-15', notes: null },
  { id: '9', cat_id: '2', weight_kg: 0.45, recorded_at: '2024-07-15', notes: null },
  { id: '10', cat_id: '2', weight_kg: 1.1, recorded_at: '2024-08-15', notes: null },
  { id: '11', cat_id: '2', weight_kg: 1.8, recorded_at: '2024-09-15', notes: null },
  { id: '12', cat_id: '2', weight_kg: 2.5, recorded_at: '2024-10-15', notes: null },
  { id: '13', cat_id: '2', weight_kg: 3.1, recorded_at: '2024-11-15', notes: null },
  { id: '14', cat_id: '2', weight_kg: 3.6, recorded_at: '2024-12-15', notes: null },
  { id: '15', cat_id: '2', weight_kg: 3.9, recorded_at: '2025-01-15', notes: null },
  { id: '16', cat_id: '2', weight_kg: 4.1, recorded_at: '2025-02-15', notes: null },
]

export const mockHealthRecords: HealthRecord[] = [
  {
    id: '1', cat_id: '1', record_type: 'vaccine', title: 'FVRCP (Core Vaccine)',
    description: 'First dose of feline distemper combo vaccine',
    date: '2024-08-15', next_due_date: '2025-08-15', created_at: '2024-08-15T00:00:00Z',
  },
  {
    id: '2', cat_id: '1', record_type: 'vaccine', title: 'Rabies Vaccine',
    description: 'Annual rabies vaccination',
    date: '2024-10-01', next_due_date: '2025-10-01', created_at: '2024-10-01T00:00:00Z',
  },
  {
    id: '3', cat_id: '1', record_type: 'deworm', title: 'Deworming Treatment',
    description: 'Broad-spectrum deworming',
    date: '2025-01-15', next_due_date: '2025-04-15', created_at: '2025-01-15T00:00:00Z',
  },
  {
    id: '4', cat_id: '2', record_type: 'vaccine', title: 'FVRCP (Core Vaccine)',
    description: 'First dose of feline distemper combo vaccine',
    date: '2024-08-15', next_due_date: '2025-08-15', created_at: '2024-08-15T00:00:00Z',
  },
  {
    id: '5', cat_id: '2', record_type: 'vaccine', title: 'Rabies Vaccine',
    description: 'Annual rabies vaccination',
    date: '2024-10-01', next_due_date: '2025-10-01', created_at: '2024-10-01T00:00:00Z',
  },
  {
    id: '6', cat_id: '2', record_type: 'deworm', title: 'Deworming Treatment',
    description: 'Broad-spectrum deworming',
    date: '2025-01-15', next_due_date: '2025-04-15', created_at: '2025-01-15T00:00:00Z',
  },
  {
    id: '7', cat_id: '1', record_type: 'vet_visit', title: 'Annual Checkup',
    description: 'General health examination, all clear',
    date: '2025-02-01', next_due_date: '2026-02-01', created_at: '2025-02-01T00:00:00Z',
  },
]

export const mockFoodLogs: FoodLog[] = [
  {
    id: '1', cat_id: '1', food_name: 'Royal Canin British Shorthair', food_type: 'dry',
    amount_grams: 40, meal_time: 'breakfast', date: '2025-03-07', notes: null, created_at: '2025-03-07T08:00:00Z',
  },
  {
    id: '2', cat_id: '1', food_name: 'Fancy Feast Pate', food_type: 'wet',
    amount_grams: 85, meal_time: 'dinner', date: '2025-03-07', notes: null, created_at: '2025-03-07T18:00:00Z',
  },
  {
    id: '3', cat_id: '2', food_name: 'Royal Canin British Shorthair', food_type: 'dry',
    amount_grams: 35, meal_time: 'breakfast', date: '2025-03-07', notes: null, created_at: '2025-03-07T08:00:00Z',
  },
  {
    id: '4', cat_id: '2', food_name: 'Greenies Dental Treats', food_type: 'treat',
    amount_grams: 10, meal_time: 'snack', date: '2025-03-07', notes: 'Loved it!', created_at: '2025-03-07T15:00:00Z',
  },
  {
    id: '5', cat_id: '2', food_name: 'Sheba Cuts in Gravy', food_type: 'wet',
    amount_grams: 85, meal_time: 'dinner', date: '2025-03-07', notes: null, created_at: '2025-03-07T18:00:00Z',
  },
]

// Helper to get data by cat
export function getCatWeights(catId: string) {
  return mockWeightRecords.filter(w => w.cat_id === catId).sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
}

export function getCatHealth(catId: string) {
  return mockHealthRecords.filter(h => h.cat_id === catId).sort((a, b) => b.date.localeCompare(a.date))
}

export function getCatFood(catId: string, date: string) {
  return mockFoodLogs.filter(f => f.cat_id === catId && f.date === date)
}

export function getUpcomingRecords() {
  const today = new Date().toISOString().split('T')[0]
  return mockHealthRecords
    .filter(h => h.next_due_date && h.next_due_date >= today)
    .sort((a, b) => (a.next_due_date ?? '').localeCompare(b.next_due_date ?? ''))
}

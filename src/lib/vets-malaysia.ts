import type { Vet } from './supabase'

// Popular veterinary clinics across Malaysia
// Google Maps links for navigation
export const malaysianVets: Vet[] = [
  // Kuala Lumpur
  { name: "The Animal Clinic", area: "Bangsar", state: "KL", maps_url: "https://maps.google.com/?q=The+Animal+Clinic+Bangsar+KL" },
  { name: "Gasing Veterinary Hospital", area: "Petaling Jaya", state: "Selangor", maps_url: "https://maps.google.com/?q=Gasing+Veterinary+Hospital+Petaling+Jaya" },
  { name: "Vertex Veterinary Clinic", area: "Damansara Uptown", state: "Selangor", maps_url: "https://maps.google.com/?q=Vertex+Veterinary+Clinic+Damansara+Uptown" },
  { name: "The Pet Clinic", area: "TTDI", state: "KL", maps_url: "https://maps.google.com/?q=The+Pet+Clinic+TTDI+KL" },
  { name: "Paws & Claws Veterinary Clinic", area: "Mont Kiara", state: "KL", maps_url: "https://maps.google.com/?q=Paws+Claws+Veterinary+Clinic+Mont+Kiara" },
  { name: "Animal Medical Centre (AMC)", area: "Jalan Tun Razak", state: "KL", maps_url: "https://maps.google.com/?q=Animal+Medical+Centre+Jalan+Tun+Razak+KL" },
  { name: "Kiara Veterinary Clinic", area: "Sri Hartamas", state: "KL", maps_url: "https://maps.google.com/?q=Kiara+Veterinary+Clinic+Sri+Hartamas" },
  { name: "Healthvet Veterinary Clinic", area: "Desa Sri Hartamas", state: "KL", maps_url: "https://maps.google.com/?q=Healthvet+Veterinary+Clinic+Desa+Sri+Hartamas" },
  { name: "Dr Siew's Clinic", area: "Taman SEA", state: "Selangor", maps_url: "https://maps.google.com/?q=Dr+Siew+Veterinary+Clinic+Taman+SEA" },

  // Selangor
  { name: "Tropicana Veterinary Clinic", area: "Tropicana", state: "Selangor", maps_url: "https://maps.google.com/?q=Tropicana+Veterinary+Clinic+Selangor" },
  { name: "Ara Veterinary Clinic", area: "Ara Damansara", state: "Selangor", maps_url: "https://maps.google.com/?q=Ara+Veterinary+Clinic+Ara+Damansara" },
  { name: "Valley Veterinary Clinic", area: "Kota Damansara", state: "Selangor", maps_url: "https://maps.google.com/?q=Valley+Veterinary+Clinic+Kota+Damansara" },
  { name: "My Family Vet", area: "Puchong", state: "Selangor", maps_url: "https://maps.google.com/?q=My+Family+Vet+Puchong" },
  { name: "Setia Alam Veterinary Clinic", area: "Setia Alam", state: "Selangor", maps_url: "https://maps.google.com/?q=Setia+Alam+Veterinary+Clinic" },
  { name: "Subang Veterinary Clinic", area: "Subang Jaya", state: "Selangor", maps_url: "https://maps.google.com/?q=Subang+Veterinary+Clinic+Subang+Jaya" },
  { name: "Cheras Veterinary Clinic", area: "Cheras", state: "Selangor", maps_url: "https://maps.google.com/?q=Cheras+Veterinary+Clinic" },
  { name: "University Veterinary Hospital (UPM)", area: "Serdang", state: "Selangor", maps_url: "https://maps.google.com/?q=University+Veterinary+Hospital+UPM+Serdang" },

  // Penang
  { name: "Island Veterinary Clinic", area: "Georgetown", state: "Penang", maps_url: "https://maps.google.com/?q=Island+Veterinary+Clinic+Georgetown+Penang" },
  { name: "Pet Lovers Veterinary Clinic", area: "Bayan Lepas", state: "Penang", maps_url: "https://maps.google.com/?q=Pet+Lovers+Veterinary+Clinic+Bayan+Lepas+Penang" },
  { name: "Vet Plus Animal Clinic", area: "Jelutong", state: "Penang", maps_url: "https://maps.google.com/?q=Vet+Plus+Animal+Clinic+Jelutong+Penang" },

  // Johor
  { name: "Taman Molek Veterinary Clinic", area: "Johor Bahru", state: "Johor", maps_url: "https://maps.google.com/?q=Taman+Molek+Veterinary+Clinic+JB" },
  { name: "Bestari Veterinary Clinic", area: "Johor Bahru", state: "Johor", maps_url: "https://maps.google.com/?q=Bestari+Veterinary+Clinic+Johor+Bahru" },
  { name: "JB Veterinary Clinic", area: "Johor Bahru", state: "Johor", maps_url: "https://maps.google.com/?q=JB+Veterinary+Clinic+Johor+Bahru" },

  // Others
  { name: "Ipoh Veterinary Clinic", area: "Ipoh", state: "Perak", maps_url: "https://maps.google.com/?q=Ipoh+Veterinary+Clinic" },
  { name: "Melaka Veterinary Clinic", area: "Melaka", state: "Melaka", maps_url: "https://maps.google.com/?q=Melaka+Veterinary+Clinic" },
  { name: "Kota Kinabalu Vet Clinic", area: "Kota Kinabalu", state: "Sabah", maps_url: "https://maps.google.com/?q=Kota+Kinabalu+Veterinary+Clinic" },
  { name: "Kuching Veterinary Clinic", area: "Kuching", state: "Sarawak", maps_url: "https://maps.google.com/?q=Kuching+Veterinary+Clinic" },
]

// Group vets by state for the dropdown
export function getVetsByState() {
  const grouped: Record<string, Vet[]> = {}
  for (const vet of malaysianVets) {
    if (!grouped[vet.state]) grouped[vet.state] = []
    grouped[vet.state].push(vet)
  }
  return grouped
}

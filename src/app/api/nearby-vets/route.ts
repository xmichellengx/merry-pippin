import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 })
  }

  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)
  if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Google API key not configured' }, { status: 500 })
  }

  try {
    // Use Google Places Nearby Search
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
    url.searchParams.set('location', `${lat},${lng}`)
    url.searchParams.set('radius', '10000') // 10km radius
    url.searchParams.set('type', 'veterinary_care')
    url.searchParams.set('key', apiKey)

    const res = await fetch(url.toString())
    const data = await res.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places error:', data.status, data.error_message)
      return NextResponse.json({ error: 'Failed to fetch nearby vets' }, { status: 500 })
    }

    const vets = (data.results ?? []).map((place: {
      name: string
      vicinity: string
      geometry: { location: { lat: number; lng: number } }
      rating?: number
      user_ratings_total?: number
      place_id: string
      opening_hours?: { open_now: boolean }
      business_status?: string
    }) => ({
      name: place.name,
      address: place.vicinity,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      rating: place.rating ?? null,
      totalRatings: place.user_ratings_total ?? 0,
      placeId: place.place_id,
      openNow: place.opening_hours?.open_now ?? null,
      mapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      isOpen: place.business_status === 'OPERATIONAL',
    }))

    return NextResponse.json({ vets })
  } catch (err) {
    console.error('Nearby vets error:', err)
    return NextResponse.json({ error: 'Failed to fetch nearby vets' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ vets: [] })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Google API key not configured' }, { status: 500 })
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
    url.searchParams.set('query', `${query} veterinary clinic`)
    url.searchParams.set('type', 'veterinary_care')
    url.searchParams.set('key', apiKey)

    const res = await fetch(url.toString())
    const data = await res.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places search error:', data.status, data.error_message)
      return NextResponse.json({ error: data.error_message || data.status }, { status: 500 })
    }

    const vets = (data.results ?? []).slice(0, 8).map((place: {
      name: string
      formatted_address: string
      geometry: { location: { lat: number; lng: number } }
      rating?: number
      user_ratings_total?: number
      place_id: string
      opening_hours?: { open_now: boolean }
      business_status?: string
    }) => ({
      name: place.name,
      address: place.formatted_address,
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
    console.error('Search vets error:', err)
    return NextResponse.json({ error: 'Failed to search vets' }, { status: 500 })
  }
}

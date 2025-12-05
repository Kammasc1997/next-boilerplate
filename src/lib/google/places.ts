import { validateGooglePlacesResponse, validateGooglePlaceDetails } from './types';
import type { GooglePlace, GooglePlaceDetails } from '@/types/google';

const GOOGLE_PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';

export interface NearbySearchParams {
  lat: number;
  lng: number;
  radius?: number;
  type?: string;
}

export interface PlaceDetailsParams {
  placeId: string;
  fields?: string[];
}

/**
 * Fetcher nærmeste steder fra Google Places Nearby Search API
 */
export async function getNearbyPlaces(params: NearbySearchParams): Promise<GooglePlace[]> {
  const apiKey = process.env.GOOGLE_MAPS_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_PLACES_API_KEY environment variable is not set');
  }

  const { lat, lng, radius = 1000, type = 'cafe|restaurant' } = params;

  const url = new URL(`${GOOGLE_PLACES_API_BASE}/nearbysearch/json`);
  url.searchParams.set('location', `${lat},${lng}`);
  url.searchParams.set('radius', radius.toString());
  url.searchParams.set('type', type);
  url.searchParams.set('key', apiKey);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    const validatedResponse = validateGooglePlacesResponse(data);
    return validatedResponse.results;
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch nearby places');
  }
}

/**
 * Fetcher detaljerede oplysninger om et sted fra Google Places Place Details API
 */
export async function getPlaceDetails(params: PlaceDetailsParams): Promise<GooglePlaceDetails> {
  const apiKey = process.env.GOOGLE_MAPS_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_PLACES_API_KEY environment variable is not set');
  }

  const { placeId, fields = ['name', 'geometry', 'opening_hours', 'photos', 'rating', 'formatted_address'] } = params;

  const url = new URL(`${GOOGLE_PLACES_API_BASE}/details/json`);
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', fields.join(','));
  url.searchParams.set('key', apiKey);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache for 1 hour (opening hours don't change frequently)
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    return validateGooglePlaceDetails(data.result);
  } catch (error) {
    console.error('Error fetching place details:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch place details');
  }
}

/**
 * Konverterer Google Place til Venue format
 */
export function googlePlaceToVenue(place: GooglePlace): {
  id: string;
  placeId: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  rating?: number;
  userRatingsTotal?: number;
  photos?: string[];
  isOpenNow?: boolean;
  openingHours?: string[];
} {
  return {
    id: place.place_id,
    placeId: place.place_id,
    name: place.name,
    latitude: place.geometry.location.lat,
    longitude: place.geometry.location.lng,
    address: place.vicinity,
    rating: place.rating,
    userRatingsTotal: place.user_ratings_total,
    photos: place.photos?.map((photo) => photo.photo_reference),
    isOpenNow: place.opening_hours?.open_now ?? place.current_opening_hours?.open_now,
    openingHours: place.opening_hours?.weekday_text ?? place.current_opening_hours?.weekday_text,
  };
}


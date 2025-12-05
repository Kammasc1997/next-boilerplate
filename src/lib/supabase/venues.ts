import { supabase } from './client';
import type { Venue } from '@/types/venue';

export interface SupabaseVenue {
  id: string;
  external_place_id: string;
  name: string;
  latitude: number;
  longitude: number;
  has_outdoor_seating: boolean;
  manual_opening_hours: unknown;
  notes: string | null;
  updated_at: string;
}

/**
 * Henter venue metadata fra Supabase baseret på Google Places place_id
 */
export async function getVenueMetadata(placeId: string): Promise<SupabaseVenue | null> {
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('external_place_id', placeId)
      .single();

    if (error) {
      // PGRST116 = not found (no rows returned)
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as SupabaseVenue;
  } catch (error) {
    console.error('Error fetching venue metadata:', error);
    return null;
  }
}

/**
 * Henter metadata for flere venues baseret på place IDs
 */
export async function getVenuesMetadata(placeIds: string[]): Promise<Map<string, SupabaseVenue>> {
  if (placeIds.length === 0) {
    return new Map();
  }

  try {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .in('external_place_id', placeIds);

    if (error) {
      throw error;
    }

    const metadataMap = new Map<string, SupabaseVenue>();
    (data as SupabaseVenue[]).forEach((venue) => {
      metadataMap.set(venue.external_place_id, venue);
    });

    return metadataMap;
  } catch (error) {
    console.error('Error fetching venues metadata:', error);
    return new Map();
  }
}

/**
 * Enrich venue data med Supabase metadata
 */
export function enrichVenueWithMetadata(
  venue: Venue,
  metadata: SupabaseVenue | null
): Venue {
  if (!metadata) {
    return venue;
  }

  return {
    ...venue,
    hasOutdoorSeating: metadata.has_outdoor_seating,
    notes: metadata.notes ?? undefined,
    // Hvis manual_opening_hours er sat, brug det i stedet for Google's data
    // openingHours: metadata.manual_opening_hours ? parseManualOpeningHours(metadata.manual_opening_hours) : venue.openingHours,
  };
}

/**
 * Enrich flere venues med Supabase metadata
 */
export async function enrichVenuesWithMetadata(venues: Venue[]): Promise<Venue[]> {
  const placeIds = venues.map((v) => v.placeId);
  const metadataMap = await getVenuesMetadata(placeIds);

  return venues.map((venue) => {
    const metadata = metadataMap.get(venue.placeId);
    return enrichVenueWithMetadata(venue, metadata ?? null);
  });
}


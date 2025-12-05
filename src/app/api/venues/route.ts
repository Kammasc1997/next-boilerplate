import { NextRequest, NextResponse } from 'next/server';
import { getNearbyPlaces, getPlaceDetails, googlePlaceToVenue } from '@/lib/google/places';
import { getCurrentSky, getForecast, calculateSunStatus } from '@/lib/dmi';
import { enrichVenuesWithMetadata } from '@/lib/supabase';
import type { VenueWithWeather } from '@/types/venue';
import type { ApiResult } from '@/types/api';

/**
 * GET handler for /api/venues
 * Fetcher nærmeste venues med vejrdata og metadata
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResult<VenueWithWeather[]>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid lat/lng parameters',
        },
        { status: 400 }
      );
    }

    // 1. Fetch Google Places
    const places = await getNearbyPlaces({ lat, lng, radius: 1000 });

    if (places.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // 2. Fetch place details for each place (for opening hours, etc.)
    const placesWithDetails = await Promise.all(
      places.map(async (place) => {
        try {
          const details = await getPlaceDetails({ placeId: place.place_id });
          return details;
        } catch (error) {
          console.error(`Error fetching details for ${place.place_id}:`, error);
          return place; // Fallback to basic place data
        }
      })
    );

    // 3. Convert to Venue format
    let venues = placesWithDetails.map((place) => googlePlaceToVenue(place));

    // 4. Enrich with Supabase metadata
    venues = await enrichVenuesWithMetadata(venues);

    // 5. Fetch weather data for each venue
    const venuesWithWeather: VenueWithWeather[] = await Promise.all(
      venues.map(async (venue) => {
        try {
          // Fetch current sky observation and forecast in parallel
          const [currentSky, forecast] = await Promise.all([
            getCurrentSky(venue.latitude, venue.longitude),
            getForecast(venue.latitude, venue.longitude),
          ]);

          // Calculate sun status
          const sunStatus = currentSky
            ? calculateSunStatus(
                venue.latitude,
                venue.longitude,
                currentSky.value,
                new Date(currentSky.timeObs)
              )
            : calculateSunStatus(venue.latitude, venue.longitude, undefined);

          return {
            ...venue,
            weather: {
              current: {
                cloudCover: currentSky?.value,
                sunVisible: sunStatus.sunVisible,
                timestamp: sunStatus.timestamp,
              },
              forecast: forecast.length > 0 ? forecast : undefined,
            },
          };
        } catch (error) {
          console.error(`Error fetching weather for venue ${venue.id}:`, error);
          // Return venue without weather data if weather fetch fails
          return {
            ...venue,
            weather: undefined,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: venuesWithWeather,
    });
  } catch (error) {
    console.error('Error in /api/venues:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}


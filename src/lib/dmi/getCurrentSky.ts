import { dmiObservationSchema } from '@/types/weather';
import type { DmiObservation } from '@/types/weather';
import { findNearestStation } from './calculateSunStatus';

const DMI_API_BASE = process.env.DMI_API_BASE_URL || 'https://dmigw.govcloud.dk';

/**
 * Henter nuværende sky-dække observation fra DMI API
 */
export async function getCurrentSky(lat: number, lng: number): Promise<DmiObservation | null> {
  const apiKey = process.env.DMI_API_KEY;
  if (!apiKey) {
    throw new Error('DMI_API_KEY environment variable is not set');
  }

  try {
    const stationId = findNearestStation(lat, lng);

    const url = new URL(`${DMI_API_BASE}/metObs/v2/observation`);
    url.searchParams.set('stationId', stationId);
    url.searchParams.set('parameterId', 'cloud_cover');
    url.searchParams.set('limit', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'X-API-Key': apiKey,
      },
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (!response.ok) {
      throw new Error(`DMI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const observation = dmiObservationSchema.parse(data[0]);
      return observation;
    }

    return null;
  } catch (error) {
    console.error('Error fetching current sky observation:', error);
    // Return null i stedet for at kaste fejl, så appen kan fortsætte uden vejrdata
    return null;
  }
}


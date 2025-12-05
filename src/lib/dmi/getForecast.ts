import { dmiForecastSchema } from '@/types/weather';
import type { DmiForecast } from '@/types/weather';
import { calculateForecastSunStatus } from './calculateSunStatus';
import type { WeatherForecast } from '@/types/weather';

const DMI_API_BASE = process.env.DMI_API_BASE_URL || 'https://dmigw.govcloud.dk';

/**
 * Henter vejrprognose fra DMI API
 * Note: Dette er en forenklet implementering. Juster endpoint efter DMI's faktiske API struktur
 */
export async function getForecast(lat: number, lng: number): Promise<WeatherForecast[]> {
  const apiKey = process.env.DMI_API_KEY;
  if (!apiKey) {
    throw new Error('DMI_API_KEY environment variable is not set');
  }

  try {
    // Note: Dette endpoint kan variere afhængigt af DMI's faktiske API struktur
    // Tjek DMI dokumentation for korrekt endpoint
    const url = new URL(`${DMI_API_BASE}/metFc/dmiWeather`);
    url.searchParams.set('latitude', lat.toString());
    url.searchParams.set('longitude', lng.toString());
    url.searchParams.set('parameterId', 'cloud_cover');

    const response = await fetch(url.toString(), {
      headers: {
        'X-API-Key': apiKey,
      },
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      throw new Error(`DMI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Parse response baseret på DMI's faktiske struktur
    // Dette er en placeholder - juster efter faktisk API response format
    let forecasts: DmiForecast[] = [];

    if (Array.isArray(data)) {
      forecasts = data.map((item) => dmiForecastSchema.parse(item));
    } else if (data.forecasts && Array.isArray(data.forecasts)) {
      forecasts = data.forecasts.map((item: unknown) => dmiForecastSchema.parse(item));
    } else if (data.data && Array.isArray(data.data)) {
      forecasts = data.data.map((item: unknown) => dmiForecastSchema.parse(item));
    }

    // Konverter til WeatherForecast format med solstatus beregning
    const weatherForecasts: WeatherForecast[] = forecasts
      .slice(0, 4) // Tag kun de første 4 timeblokke
      .map((forecast) =>
        calculateForecastSunStatus(
          lat,
          lng,
          forecast.value,
          forecast.validFrom,
          forecast.validTo
        )
      );

    return weatherForecasts;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    // Return tom array i stedet for at kaste fejl
    return [];
  }
}


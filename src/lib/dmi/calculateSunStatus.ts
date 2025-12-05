import * as SunCalc from 'suncalc';
import type { SunStatus, WeatherForecast } from '@/types/weather';

/**
 * Beregner solstatus baseret på koordinater, tidspunkt og sky-dække
 */
export function calculateSunStatus(
  lat: number,
  lng: number,
  cloudCover: number | undefined,
  timestamp: Date = new Date()
): SunStatus {
  const sunPosition = SunCalc.getPosition(timestamp, lat, lng);
  const sunAltitude = (sunPosition.altitude * 180) / Math.PI; // Konverter fra radianer til grader

  // Solen er synlig hvis den er over horisonten (altitude > 0) og sky-dække er under 50%
  const sunVisible = sunAltitude > 0 && (cloudCover === undefined || cloudCover < 50);

  return {
    sunVisible,
    sunAltitude,
    cloudCover,
    timestamp: timestamp.toISOString(),
  };
}

/**
 * Beregner solstatus for en forecast periode
 */
export function calculateForecastSunStatus(
  lat: number,
  lng: number,
  cloudCover: number,
  validFrom: string,
  validTo: string
): WeatherForecast {
  const fromDate = new Date(validFrom);
  const toDate = new Date(validTo);
  const midDate = new Date((fromDate.getTime() + toDate.getTime()) / 2);

  const sunStatus = calculateSunStatus(lat, lng, cloudCover, midDate);

  return {
    cloudCover,
    sunVisible: sunStatus.sunVisible,
    sunAltitude: sunStatus.sunAltitude,
    validFrom,
    validTo,
  };
}

/**
 * Finder nærmeste DMI station baseret på koordinater
 * Note: Dette er en forenklet implementering. I produktion skal du bruge DMI's station liste API
 */
export function findNearestStation(lat: number, lng: number): string {
  // Foreløbigt hardcoded station ID for København
  // I produktion skal dette hentes fra DMI's station API eller bruge en station database
  const copenhagenStation = '06181'; // København station ID (eksempel)
  
  // TODO: Implementer faktisk station lookup baseret på koordinater
  // Dette kunne være en API call til DMI eller en lokal database med stationer
  return copenhagenStation;
}


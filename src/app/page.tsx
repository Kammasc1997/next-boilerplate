'use client';

import { useEffect, useState } from 'react';
import MapCanvas from '@/components/MapCanvas';
import VenueCard from '@/components/VenueCard';
import FilterBar from '@/components/FilterBar';
import type { VenueWithWeather, VenueFilter } from '@/types/venue';
import type { ApiResult } from '@/types/api';

const DEFAULT_LOCATION = {
  lat: 55.6761, // København
  lng: 12.5683,
};

function filterVenues(venues: VenueWithWeather[], filter: VenueFilter): VenueWithWeather[] {
  switch (filter) {
    case 'open-now':
      return venues.filter((v) => v.isOpenNow === true);
    case 'sun-now':
      return venues.filter((v) => v.weather?.current?.sunVisible === true);
    case 'sun-later':
      return venues.filter(
        (v) =>
          v.weather?.current?.sunVisible === false &&
          v.weather?.forecast?.some((f) => f.sunVisible === true)
      );
    case 'outdoor-seating':
      return venues.filter((v) => v.hasOutdoorSeating === true);
    default:
      return venues;
  }
}

export default function Home() {
  const [venues, setVenues] = useState<VenueWithWeather[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<VenueWithWeather[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<VenueWithWeather | undefined>();
  const [activeFilter, setActiveFilter] = useState<VenueFilter>('all');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Fallback to default location or env variable
          const defaultLocation = process.env.NEXT_PUBLIC_DEFAULT_LOCATION;
          if (defaultLocation) {
            const [lat, lng] = defaultLocation.split(',').map(Number);
            setLocation({ lat, lng });
          } else {
            setLocation(DEFAULT_LOCATION);
          }
        }
      );
    } else {
      // Fallback to default location
      const defaultLocation = process.env.NEXT_PUBLIC_DEFAULT_LOCATION;
      if (defaultLocation) {
        const [lat, lng] = defaultLocation.split(',').map(Number);
        setLocation({ lat, lng });
      } else {
        setLocation(DEFAULT_LOCATION);
      }
    }
  }, []);

  // Fetch venues when location is available
  useEffect(() => {
    if (!location) return;

    const fetchVenues = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/venues?lat=${location.lat}&lng=${location.lng}`
        );
        const result: ApiResult<VenueWithWeather[]> = await response.json();

        if (result.success && result.data) {
          setVenues(result.data);
        } else {
          setError(result.error || 'Failed to fetch venues');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenues();
  }, [location]);

  // Apply filter when venues or filter changes
  useEffect(() => {
    const filtered = filterVenues(venues, activeFilter);
    setFilteredVenues(filtered);
  }, [venues, activeFilter]);

  if (!location) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Henter lokation...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">Solspot</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Find caféer og restauranter med sol lige nu
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 lg:flex-row">
        {/* Map Section */}
        <div className="h-[400px] w-full lg:h-auto lg:flex-1">
          <MapCanvas
            venues={filteredVenues}
            center={location}
            selectedVenue={selectedVenue}
            onVenueSelect={setSelectedVenue}
          />
        </div>

        {/* Sidebar with filters and venue list */}
        <div className="flex w-full flex-col gap-4 lg:w-96">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
              Filtre
            </h2>
            <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>

          <div className="flex-1 overflow-y-auto">
            <h2 className="mb-2 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
              Steder ({filteredVenues.length})
            </h2>

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <p className="text-zinc-600 dark:text-zinc-400">Indlæser steder...</p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            {!isLoading && !error && filteredVenues.length === 0 && (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Ingen steder fundet med de valgte filtre.
                </p>
              </div>
            )}

            {!isLoading && !error && filteredVenues.length > 0 && (
              <div className="flex flex-col gap-3">
                {filteredVenues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    onSelect={setSelectedVenue}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

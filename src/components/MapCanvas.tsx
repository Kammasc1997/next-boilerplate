'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { VenueWithWeather } from '@/types/venue';

interface MapCanvasProps {
  venues: VenueWithWeather[];
  center: { lat: number; lng: number };
  selectedVenue?: VenueWithWeather;
  onVenueSelect?: (venue: VenueWithWeather) => void;
}

export default function MapCanvas({
  venues,
  center,
  selectedVenue,
  onVenueSelect,
}: Readonly<MapCanvasProps>) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setError('Google Maps API key not configured');
        setIsLoading(false);
      }, 0);
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    });

    loader
      .load()
      .then(() => {
        if (!mapRef.current) return;

        const googleMap = new google.maps.Map(mapRef.current, {
          center,
          zoom: 14,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        });

        setMap(googleMap);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err);
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => {
          setError('Failed to load Google Maps');
          setIsLoading(false);
        }, 0);
      });
  }, [center]);

  // Update markers when venues change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    const currentMarkers = [...markers];
    currentMarkers.forEach((marker) => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = venues.map((venue) => {
      const sunVisible = venue.weather?.current?.sunVisible ?? false;
      const icon = sunVisible
        ? {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#FCD34D',
            fillOpacity: 1,
            strokeColor: '#F59E0B',
            strokeWeight: 2,
          }
        : {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#9CA3AF',
            fillOpacity: 1,
            strokeColor: '#6B7280',
            strokeWeight: 2,
          };

      const marker = new google.maps.Marker({
        position: { lat: venue.latitude, lng: venue.longitude },
        map,
        title: venue.name,
        icon,
      });

      marker.addListener('click', () => {
        onVenueSelect?.(venue);
        map.setCenter({ lat: venue.latitude, lng: venue.longitude });
        map.setZoom(16);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Center map on selected venue
    if (selectedVenue) {
      map.setCenter({ lat: selectedVenue.latitude, lng: selectedVenue.longitude });
      map.setZoom(16);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, venues, selectedVenue, onVenueSelect]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading map...</p>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full rounded-lg" />
    </div>
  );
}


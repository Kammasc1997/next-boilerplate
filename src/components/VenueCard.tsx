import SunBadge from './SunBadge';
import type { VenueWithWeather } from '@/types/venue';

interface VenueCardProps {
  venue: VenueWithWeather;
  onSelect?: (venue: VenueWithWeather) => void;
}

export default function VenueCard({ venue, onSelect }: Readonly<VenueCardProps>) {
  const sunVisibleNow = venue.weather?.current?.sunVisible ?? false;
  const sunVisibleLater = venue.weather?.forecast?.some((f) => f.sunVisible) ?? false;
  const isOpen = venue.isOpenNow ?? false;

  return (
    <div
      className={`cursor-pointer rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 ${
        onSelect ? 'hover:border-zinc-300 dark:hover:border-zinc-700' : ''
      }`}
      onClick={() => onSelect?.(venue)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            {venue.name}
          </h3>
          {venue.address && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{venue.address}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {isOpen ? (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Åben nu
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                Lukket
              </span>
            )}

            {sunVisibleNow && <SunBadge sunVisible={true} />}
            {!sunVisibleNow && sunVisibleLater && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                <span>⏰</span>
                <span>Sol senere</span>
              </span>
            )}

            {venue.hasOutdoorSeating && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                🪑 Udenfor
              </span>
            )}

            {venue.rating && (
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                ⭐ {venue.rating.toFixed(1)}
                {venue.userRatingsTotal && ` (${venue.userRatingsTotal})`}
              </span>
            )}
          </div>

          {venue.notes && (
            <p className="mt-2 text-sm italic text-zinc-500 dark:text-zinc-500">{venue.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}


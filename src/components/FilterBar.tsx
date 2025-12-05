'use client';

import type { VenueFilter } from '@/types/venue';

interface FilterBarProps {
  activeFilter: VenueFilter;
  onFilterChange: (filter: VenueFilter) => void;
}

const filters: { id: VenueFilter; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'open-now', label: 'Åben nu' },
  { id: 'sun-now', label: 'Sol nu' },
  { id: 'sun-later', label: 'Sol senere' },
  { id: 'outdoor-seating', label: 'Udenfor' },
];

export default function FilterBar({ activeFilter, onFilterChange }: Readonly<FilterBarProps>) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeFilter === filter.id
              ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}


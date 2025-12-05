interface SunBadgeProps {
  sunVisible: boolean;
  className?: string;
}

export default function SunBadge({ sunVisible, className = '' }: Readonly<SunBadgeProps>) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
        sunVisible
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
      } ${className}`}
    >
      {sunVisible ? (
        <>
          <span>☀️</span>
          <span>Sol</span>
        </>
      ) : (
        <>
          <span>☁️</span>
          <span>Skyet</span>
        </>
      )}
    </span>
  );
}


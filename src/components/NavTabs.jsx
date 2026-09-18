const tabs = [
  {
    id: 'ozet',
    label: 'Özet',
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="1" y="9" width="3" height="6" rx="1" fill="#2D9F5A" />
        <rect x="6.5" y="5" width="3" height="10" rx="1" fill="#F97316" />
        <rect x="12" y="2" width="3" height="13" rx="1" fill="#3B82F6" />
      </svg>
    ),
  },
  {
    id: 'ekle',
    label: 'Ekle',
    icon: (
      <svg
        className="h-4 w-4 text-gray-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden="true"
      >
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'premium',
    label: 'Premium',
    icon: (
      <svg
        className="h-4 w-4 text-amber-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="2 20 22 20 19 9 15 15 12 7 9 15 5 9 2 20" />
      </svg>
    ),
  },
  {
    id: 'profil',
    label: 'Profil',
    icon: (
      <svg
        className="h-4 w-4 text-gray-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
      </svg>
    ),
  }
]

export default function NavTabs({ activeTab, onTabChange }) {
  return (
    <nav className="mt-4 flex gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-3 py-3 text-sm font-semibold shadow-nav transition-colors ${
              isActive
                ? 'text-gray-800 ring-1 ring-gray-100'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
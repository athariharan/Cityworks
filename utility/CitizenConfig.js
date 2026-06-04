export const GENDER_DISPLAY = {
  MALE:   { symbol: "♂", label: "Male" },
  FEMALE: { symbol: "♀", label: "Female" },
  OTHER:  { symbol: "⚬", label: "Other" },
};

// Short combined string (symbol + label) for compact displays like dropdowns.
export const GENDER_LABEL = { MALE: "♂ Male", FEMALE: "♀ Female", OTHER: "⚬ Other" };

// Cards shown in the citizen home quick-actions section — each links to a core action.
export const QUICK_ACTIONS = [
  {
    icon: <i className="bi bi-plus-square-fill plus-icon"></i>,
    title: "New Request",
    desc: "Submit a city issue — roads, lights, water, parks or any public service problem.",
    label: "Get Started →",
    path: "/citizen/request/new",
    variant: "qac--green",
  },
  {
    icon: <i className="bi bi-pin-map-fill"></i>,
    title: "Track Status",
    desc: "Check real-time progress on your open requests and see estimated resolution dates.",
    label: "View Status →",
    path: "/citizen/track",
    variant: "qac--violet",
  },
  {
    icon: <i className="bi bi-clock-history"></i>,
    title: "My History",
    desc: "Browse all past requests, review resolved issues and download service reports.",
    label: "Browse History →",
    path: "/citizen/history",
    variant: "qac--slate",
  },
];

export const EXPERTISE = [
  {
    img: "https://images.unsplash.com/photo-1480714378702-aaab05297310?auto=format&fit=crop&w=720&q=80",
    fallback: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=720&q=80",
    tag: "Urban Design",
    title: "Street Design & Streetscapes",
    desc: "CityWorks enables intelligent planning and management of urban streetscapes by integrating design standards with real-time field data. Our platform supports accessible, pedestrian-friendly layouts while ensuring streamlined maintenance workflows—helping cities deliver safe, functional, and aesthetically modern street environments.",
  },
  {
    img: "https://images.unsplash.com/photo-1519331379825-2ddaaff0eb27?auto=format&fit=crop&w=720&q=80",
    fallback: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=720&q=80",
    tag: "Parks & Recreation",
    title: "Parks & Green Spaces",
    desc: "Our system supports the planning, development, and ongoing maintenance of parks and green spaces through centralized asset tracking and maintenance scheduling. CityWorks ensures cleaner, safer, and well-maintained recreational areas, enhancing community well-being and sustainable urban living.",
  },
  {
    img: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=720&q=80",
    fallback: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=720&q=80",
    tag: "Sanitation",
    title: "Waste Management & Sanitation",
    desc: "Through CityWorks, municipalities can streamline sanitation operations with real-time request tracking and service monitoring. The platform ensures timely waste collection, improved response to missed services, and data-driven planning for a cleaner, healthier urban environment.",
  },
  {
    img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=720&q=80",
    fallback: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?auto=format&fit=crop&w=720&q=80",
    tag: "Electrical",
    title: "Street Lighting & Electrical",
    desc: "CityWorks optimizes street lighting management by enabling fast issue reporting, efficient crew dispatch, and transparent maintenance tracking. From installation to repair, our platform ensures well-lit public spaces, improved safety, and consistent service delivery across all neighborhoods.",
  },
];

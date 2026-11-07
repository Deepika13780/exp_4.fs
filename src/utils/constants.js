export const PLATFORMS = [
  { id: "instagram", label: "Instagram", color: "#e1306c" },
  { id: "twitter", label: "X / Twitter", color: "#1d9bf0" },
  { id: "linkedin", label: "LinkedIn", color: "#0a66c2" },
  { id: "facebook", label: "Facebook", color: "#5b6cff" },
];

export const STATUSES = [
  { id: "draft", label: "Draft" },
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Published" },
];

export const platformColor = (id) => PLATFORMS.find((p) => p.id === id)?.color ?? "#6b7280";

// One shared, frozen empty array so selectors return a STABLE reference
// for cells that have no posts (important for memoization).
export const EMPTY = Object.freeze([]);

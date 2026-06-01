export const campaignLocationOptions = [
  { value: "ETHIOPIA", label: "Ethiopia" },
  { value: "INTERNATIONAL", label: "International" },
  { value: "ADDIS_ABABA", label: "Addis Ababa" },
  { value: "AFAR", label: "Afar" },
  { value: "AMHARA", label: "Amhara" },
  { value: "BENISHANGUL_GUMUZ", label: "Benishangul-Gumuz" },
  { value: "CENTRAL_ETHIOPIA", label: "Central Ethiopia" },
  { value: "DIRE_DAWA", label: "Dire Dawa" },
  { value: "GAMBELA", label: "Gambela" },
  { value: "HARARI", label: "Harari" },
  { value: "OROMIA", label: "Oromia" },
  { value: "SIDAMA", label: "Sidama" },
  { value: "SOMALI", label: "Somali" },
  { value: "SOUTH_ETHIOPIA", label: "South Ethiopia" },
  {
    value: "SOUTH_WEST_ETHIOPIA_PEOPLES",
    label: "South West Ethiopia Peoples'",
  },
  { value: "TIGRAY", label: "Tigray" },
] as const;

export type CampaignLocation =
  (typeof campaignLocationOptions)[number]["value"];

const locationLabelMap = campaignLocationOptions.reduce(
  (acc, item) => {
    acc[item.value] = item.label;
    return acc;
  },
  {} as Record<CampaignLocation, string>,
);

export const getCampaignLocationLabel = (location?: string | null) => {
  if (!location) return "Ethiopia";
  return (
    locationLabelMap[location as CampaignLocation] ||
    location
      .toString()
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
};

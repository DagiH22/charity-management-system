export const campaignCategoryOptions = [
  { value: "HEALTH", label: "Health" },
  { value: "EDUCATION", label: "Education" },
  { value: "DISASTER_RELIEF", label: "Disaster Relief" },
  { value: "FOOD_SUPPORT", label: "Food Support" },
  { value: "CHILDREN", label: "Children" },
  { value: "ELDERLY", label: "Elderly" },
  { value: "ENVIRONMENT", label: "Environment" },
  { value: "ANIMAL_WELFARE", label: "Animal Welfare" },
  { value: "COMMUNITY", label: "Community" },
  { value: "RELIGIOUS", label: "Religious" },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "OTHER", label: "Other" },
] as const;

export type CampaignCategory =
  (typeof campaignCategoryOptions)[number]["value"];

const categoryLabelMap = campaignCategoryOptions.reduce(
  (acc, item) => {
    acc[item.value] = item.label;
    return acc;
  },
  {} as Record<CampaignCategory, string>,
);

export const getCampaignCategoryLabel = (category?: string | null) => {
  if (!category) return "Other";
  return (
    categoryLabelMap[category as CampaignCategory] ||
    category
      .toString()
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
};

export const getCategoryBadgeColors = (category?: string | null) => {
  const defaultColors = "bg-gray-100 text-gray-700";
  if (!category) return defaultColors;

  const colorMap: Record<string, string> = {
    HEALTH: "bg-rose-100 text-rose-700",
    EDUCATION: "bg-blue-100 text-blue-700",
    DISASTER_RELIEF: "bg-red-100 text-red-700",
    FOOD_SUPPORT: "bg-orange-100 text-orange-700",
    CHILDREN: "bg-teal-100 text-teal-700",
    ELDERLY: "bg-indigo-100 text-indigo-700",
    ENVIRONMENT: "bg-emerald-100 text-emerald-700",
    ANIMAL_WELFARE: "bg-amber-100 text-amber-700",
    COMMUNITY: "bg-cyan-100 text-cyan-700",
    RELIGIOUS: "bg-purple-100 text-purple-700",
    EMERGENCY: "bg-red-100 text-red-700 font-bold border border-red-200",
    OTHER: "bg-gray-100 text-gray-700",
  };

  return colorMap[category] || defaultColors;
};

export const campaignCategoryBadgeClass =
  "rounded-full px-3 py-1 text-[11px] font-semibold";

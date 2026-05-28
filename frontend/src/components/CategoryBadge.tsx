import {
  campaignCategoryBadgeClass,
  getCampaignCategoryLabel,
  getCategoryBadgeColors,
} from "../utils/campaignCategories";

type CategoryBadgeProps = {
  category?: string | null;
  className?: string;
};

const CategoryBadge = ({ category, className }: CategoryBadgeProps) => {
  const colors = getCategoryBadgeColors(category);

  return (
    <span
      className={`${campaignCategoryBadgeClass} ${colors} ${className || ""}`.trim()}
    >
      {getCampaignCategoryLabel(category)}
    </span>
  );
};

export default CategoryBadge;

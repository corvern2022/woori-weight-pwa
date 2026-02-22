export type WeighInRow = {
  date: string;
  user_id: string;
  weight_kg: number;
  drank: boolean;
};

export type HouseholdMember = {
  user_id: string;
  display_name: string;
};

export type ChartPoint = {
  date: string;
  me: number | null;
  partner: number | null;
  meDrank: boolean;
  partnerDrank: boolean;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type AiSeries = {
  date: string;
  kg: number;
  drank?: boolean;
};

export type AiSummary = {
  range_days: number;
  today: string;
  me_label: string;
  partner_label: string;
  users: Array<{
    label: "me" | "partner";
    series: AiSeries[];
  }>;
  deltas: {
    me: { vs_yesterday: number | null; vs_week: number | null };
    partner: { vs_yesterday: number | null; vs_week: number | null };
  };
};

export type UserProfile = {
  user_id: string;
  goal_kg: number | null;
  diet_start_date: string | null;
};

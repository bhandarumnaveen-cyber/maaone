export type Settings = {
  salesOpen: boolean;
  /** YYYY-MM-DD */
  launchDate: string;
  launchDateIso: string;
  launchDateLabel: string;
  trialDays: number;
  gstRate: number;
  supportEmail: string;
  naveencodesEmail: string;
  whatsappDisplay: string;
  whatsappLink: string;
  instagramHandle: string;
  instagramUrl: string;
  appUrl: string;
};

/** A paid plan. All amounts are in paise (INR) or cents (USD). */
export type Plan = {
  code: string;
  name: string;
  tagline: string;
  inrMonthly: number;
  inrYearly: number;
  usdMonthly: number;
  usdYearly: number;
  maxUsers: number | null;
  maxBusinesses: number;
  features: string[];
  popular: boolean;
};

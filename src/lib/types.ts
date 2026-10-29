export type Settings = {
  salesOpen: boolean;
  /** YYYY-MM-DD */
  launchDate: string;
  /** The launch year ("2027") — the only part of the launch date shown on the site. */
  launchYear: string;
  trialDays: number;
  gstRate: number;
  supportEmail: string;
  naveencodesEmail: string;
  whatsappDisplay: string;
  whatsappLink: string;
  instagramHandle: string;
  instagramUrl: string;
  appUrl: string;
  /** False while app_url still points at this website (the product isn't live yet). */
  appReady: boolean;
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

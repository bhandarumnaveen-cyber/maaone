import { businessTypes } from "@/site.config";

export type FieldErrors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function str(v: unknown, max = 200): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Accepts Indian numbers with or without +91 / 0, plus international numbers. */
export function normalisePhone(v: string): string | null {
  const digits = v.replace(/[^\d+]/g, "");
  if (/^(\+?91|0)?[6-9]\d{9}$/.test(digits)) return `+91${digits.slice(-10)}`;
  if (/^\+\d{8,15}$/.test(digits)) return digits;
  return null;
}

export function validateWaitlist(input: Record<string, unknown>) {
  const data = {
    name: str(input.name, 100),
    businessName: str(input.businessName, 120),
    businessType: str(input.businessType, 80),
    city: str(input.city, 80),
    phone: str(input.phone, 20),
    email: str(input.email, 160).toLowerCase(),
    plan: str(input.plan, 20),
  };
  const errors: FieldErrors = {};
  if (data.name.length < 2) errors.name = "Please enter your name.";
  if (data.businessName.length < 2) errors.businessName = "Please enter your business name.";
  if (!businessTypes.includes(data.businessType)) errors.businessType = "Please choose your business type.";
  if (data.city.length < 2) errors.city = "Please enter your city.";
  const phone = normalisePhone(data.phone);
  if (!phone) errors.phone = "Please enter a valid mobile number.";
  else data.phone = phone;
  if (!EMAIL.test(data.email)) errors.email = "Please enter a valid email address.";
  // Plan codes are checked against the plans table in the API route; "" means not sure yet.
  if (data.plan && !/^[a-z][a-z0-9_]{1,30}$/.test(data.plan)) errors.plan = "Please choose a plan.";
  return { data, errors, ok: Object.keys(errors).length === 0 };
}

export function validateContact(input: Record<string, unknown>) {
  const data = {
    name: str(input.name, 100),
    email: str(input.email, 160).toLowerCase(),
    phone: str(input.phone, 20),
    topic: str(input.topic, 40),
    message: str(input.message, 4000),
  };
  const errors: FieldErrors = {};
  if (data.name.length < 2) errors.name = "Please enter your name.";
  if (!EMAIL.test(data.email)) errors.email = "Please enter a valid email address.";
  if (data.phone) {
    const phone = normalisePhone(data.phone);
    if (!phone) errors.phone = "Please enter a valid mobile number or leave it blank.";
    else data.phone = phone;
  }
  if (data.message.length < 10) errors.message = "Please write at least a few words.";
  return { data, errors, ok: Object.keys(errors).length === 0 };
}

export function validateFeatureRequest(input: Record<string, unknown>) {
  const data = {
    name: str(input.name, 100),
    email: str(input.email, 160).toLowerCase(),
    request: str(input.request, 2000),
  };
  const errors: FieldErrors = {};
  if (data.request.length < 10) errors.request = "Please describe the feature in a sentence or two.";
  if (data.email && !EMAIL.test(data.email)) errors.email = "Please enter a valid email or leave it blank.";
  return { data, errors, ok: Object.keys(errors).length === 0 };
}

const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export function validateBilling(input: Record<string, unknown>, states: string[]) {
  const data = {
    business_name: str(input.business_name, 160),
    gstin: str(input.gstin, 15).toUpperCase().replace(/\s/g, ""),
    address_line1: str(input.address_line1, 200),
    address_line2: str(input.address_line2, 200),
    city: str(input.city, 80),
    state: str(input.state, 80),
    pincode: str(input.pincode, 6),
  };
  const errors: FieldErrors = {};
  if (data.business_name.length < 2) errors.business_name = "Please enter your business name.";
  if (data.gstin && !GSTIN.test(data.gstin)) errors.gstin = "That doesn't look like a valid GSTIN.";
  if (data.address_line1.length < 3) errors.address_line1 = "Please enter your address.";
  if (data.city.length < 2) errors.city = "Please enter your city.";
  if (!states.includes(data.state)) errors.state = "Please choose your state.";
  if (!/^[1-9][0-9]{5}$/.test(data.pincode)) errors.pincode = "Please enter a 6-digit PIN code.";
  return { data, errors, ok: Object.keys(errors).length === 0 };
}

export function validateTicket(input: Record<string, unknown>) {
  const data = { subject: str(input.subject, 200), message: str(input.message, 5000) };
  const errors: FieldErrors = {};
  if (data.subject.length < 3) errors.subject = "Please add a short subject.";
  if (data.message.length < 10) errors.message = "Please describe the issue in a few words.";
  return { data, errors, ok: Object.keys(errors).length === 0 };
}

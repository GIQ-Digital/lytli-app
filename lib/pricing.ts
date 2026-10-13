export type PriceRegion = "americas" | "brasil" | "international"

export const TRIAL_DAYS = 5

const LATAM_COUNTRIES = new Set([
  "AR", "MX", "CO", "CL", "PE", "UY", "EC", "BO", "PY", "VE",
  "CU", "DO", "GT", "HN", "SV", "NI", "CR", "PA", "PR",
])

export function getRegionForCountry(country: string | null | undefined): PriceRegion {
  const code = country?.trim().toUpperCase()
  if (code === "BR") return "brasil"
  if (code && LATAM_COUNTRIES.has(code)) return "americas"
  return "international"
}

export const REGION_PRICES: Record<
  PriceRegion,
  { flag: string; amount: { en: string; pt: string; es: string } }
> = {
  americas: {
    flag: "🌎",
    amount: { en: "$4.99/month", pt: "US$4,99/mês", es: "US$4,99/mes" },
  },
  brasil: {
    flag: "🇧🇷",
    amount: { en: "R$19.90/month", pt: "R$19,90/mês", es: "R$19,90/mes" },
  },
  international: {
    flag: "🌍",
    amount: { en: "$9.99/month", pt: "US$9,99/mês", es: "US$9,99/mes" },
  },
}

export const REGION_ORDER: PriceRegion[] = ["americas", "brasil", "international"]

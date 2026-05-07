import { db } from "../../";
import { lookupOptions } from "../../schema";

const COUNTRIES = [
  {
    code: "AE",
    label: "United Arab Emirates",
    labelAr: "الإمارات العربية المتحدة",
  },
  { code: "BH", label: "Bahrain", labelAr: "البحرين" },
  { code: "KW", label: "Kuwait", labelAr: "الكويت" },
  { code: "OM", label: "Oman", labelAr: "عُمان" },
  { code: "QA", label: "Qatar", labelAr: "قطر" },
  { code: "SA", label: "Saudi Arabia", labelAr: "المملكة العربية السعودية" },
  { code: "EG", label: "Egypt", labelAr: "مصر" },
  { code: "JO", label: "Jordan", labelAr: "الأردن" },
  { code: "LB", label: "Lebanon", labelAr: "لبنان" },
  { code: "SY", label: "Syria", labelAr: "سوريا" },
  { code: "IQ", label: "Iraq", labelAr: "العراق" },
  { code: "YE", label: "Yemen", labelAr: "اليمن" },
  { code: "PS", label: "Palestine", labelAr: "فلسطين" },
  { code: "US", label: "United States", labelAr: "الولايات المتحدة" },
  { code: "GB", label: "United Kingdom", labelAr: "المملكة المتحدة" },
  { code: "FR", label: "France", labelAr: "فرنسا" },
  { code: "DE", label: "Germany", labelAr: "ألمانيا" },
  { code: "IN", label: "India", labelAr: "الهند" },
  { code: "PK", label: "Pakistan", labelAr: "باكستان" },
  { code: "BD", label: "Bangladesh", labelAr: "بنغلاديش" },
  { code: "PH", label: "Philippines", labelAr: "الفلبين" },
  { code: "ID", label: "Indonesia", labelAr: "إندونيسيا" },
  { code: "MY", label: "Malaysia", labelAr: "ماليزيا" },
  { code: "TR", label: "Turkey", labelAr: "تركيا" },
  { code: "IR", label: "Iran", labelAr: "إيران" },
  { code: "CN", label: "China", labelAr: "الصين" },
  { code: "JP", label: "Japan", labelAr: "اليابان" },
  { code: "KR", label: "South Korea", labelAr: "كوريا الجنوبية" },
  { code: "CA", label: "Canada", labelAr: "كندا" },
  { code: "AU", label: "Australia", labelAr: "أستراليا" },
  { code: "RU", label: "Russia", labelAr: "روسيا" },
  { code: "IT", label: "Italy", labelAr: "إيطاليا" },
  { code: "ES", label: "Spain", labelAr: "إسبانيا" },
  { code: "NL", label: "Netherlands", labelAr: "هولندا" },
  { code: "SE", label: "Sweden", labelAr: "السويد" },
  { code: "CH", label: "Switzerland", labelAr: "سويسرا" },
  { code: "SG", label: "Singapore", labelAr: "سنغافورة" },
  { code: "TH", label: "Thailand", labelAr: "تايلاند" },
  { code: "VN", label: "Vietnam", labelAr: "فيتنام" },
  { code: "ZA", label: "South Africa", labelAr: "جنوب أفريقيا" },
  { code: "NG", label: "Nigeria", labelAr: "نيجيريا" },
  { code: "KE", label: "Kenya", labelAr: "كينيا" },
  { code: "MA", label: "Morocco", labelAr: "المغرب" },
  { code: "TN", label: "Tunisia", labelAr: "تونس" },
  { code: "DZ", label: "Algeria", labelAr: "الجزائر" },
  { code: "LY", label: "Libya", labelAr: "ليبيا" },
  { code: "SD", label: "Sudan", labelAr: "السودان" },
  { code: "ET", label: "Ethiopia", labelAr: "إثيوبيا" },
  { code: "GH", label: "Ghana", labelAr: "غانا" },
  { code: "OTHER", label: "Other", labelAr: "أخرى" },
];

export const seedCountry = async () => {
  const countryRows = COUNTRIES.map((c, i) => ({
    type: "country",
    code: c.code,
    label: c.label,
    labelAr: c.labelAr,
    sortOrder: i,
    isActive: true,
    metadata: {},
  }));

  await db.insert(lookupOptions).values(countryRows);

  console.log("Lookup countries seeded successfully!");
};

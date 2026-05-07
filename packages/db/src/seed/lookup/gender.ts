import { eq } from "drizzle-orm";
import { db } from "../..";
import { lookupOptions } from "../../schema";

const GENDERS = [
  {
    code: "male",
    label: "Male",
    labelAr: "ذكر",
  },
  {
    code: "female",
    label: "Female",
    labelAr: "أنثى",
  },
  {
    code: "other",
    label: "Other",
    labelAr: "آخر",
  },
];

export const seedGender = async () => {
  try {
    console.log("👥 Seeding Gender Lookups...");

    // Delete old genders
    await db.delete(lookupOptions).where(eq(lookupOptions.type, "gender"));

    // Insert genders
    const genderRows = GENDERS.map((gender, index) => ({
      type: "gender",
      code: gender.code,
      label: gender.label,
      labelAr: gender.labelAr,
      sortOrder: index,
      isActive: true,
      metadata: {},
    }));

    await db.insert(lookupOptions).values(genderRows);

    console.log(`✅ Seeded ${GENDERS.length} genders successfully!`);
  } catch (error) {
    console.error("❌ Gender seed failed:", error);
    throw error;
  }
};

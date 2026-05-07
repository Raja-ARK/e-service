import { db } from "../..";
import { lookupDependencies, lookupOptions } from "../../schema";

const EMIRATES = [
  {
    code: "DXB",
    label: "Dubai",
    labelAr: "دبي",
  },
  {
    code: "AUH",
    label: "Abu Dhabi",
    labelAr: "أبو ظبي",
  },
  {
    code: "SHJ",
    label: "Sharjah",
    labelAr: "الشارقة",
  },
  {
    code: "AJM",
    label: "Ajman",
    labelAr: "عجمان",
  },
  {
    code: "UMQ",
    label: "Umm Al Quwain",
    labelAr: "أم القيوين",
  },
  {
    code: "RKT",
    label: "Ras Al Khaimah",
    labelAr: "رأس الخيمة",
  },
  {
    code: "FUJ",
    label: "Fujairah",
    labelAr: "الفجيرة",
  },
];

export const seedEmirate = async () => {
  const emirateRows = EMIRATES.map((c, i) => ({
    type: "emirate",
    code: c.code,
    label: c.label,
    labelAr: c.labelAr,
    sortOrder: i,
    isActive: true,
    metadata: {},
  }));

  await db.insert(lookupOptions).values(emirateRows);

  //Create dependencies (UAE country -> Emirates)
  const dependenciesToInsert = EMIRATES.map((emirate) => ({
    parentType: "country",
    parentCode: "AE", // UAE
    childType: "emirate",
    childCode: emirate.code,
    isActive: true,
  }));

  await db.insert(lookupDependencies).values(dependenciesToInsert);

  console.log("Lookup countries seeded successfully!");
};

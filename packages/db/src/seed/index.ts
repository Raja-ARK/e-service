import "dotenv/config";
import { seedEmailTemplates } from "./email-template";
import { seedCountry } from "./lookup/country";
import { seedEmirate } from "./lookup/emirate";
import { seedGender } from "./lookup/gender";
import { seedMenus } from "./menu";

const runSeeds = async () => {
  try {
    console.log("Starting seed process...");
    await seedMenus();
    await seedCountry();
    await seedEmirate();
    await seedGender();
    await seedEmailTemplates();
    console.log("All seeds completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error running seeds:", error);
    process.exit(1);
  }
};

runSeeds();

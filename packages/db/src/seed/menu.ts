import type { InferSelectModel } from "drizzle-orm";
import { db } from "..";
import { menu } from "../schema";
import type { menu as menuTable } from "../schema/menu";

type Menu = InferSelectModel<typeof menuTable>;

const externalMenus: Omit<Menu, "id" | "createdAt" | "updatedAt">[] = [
  {
    parentId: null,
    name: "Dashboard",
    nameAr: "لوحة التحكم",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-dashboard-icon lucide-layout-dashboard"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
    link: "/dashboard",
    isGroup: false,
    isActive: true,
    disabled: false,
    order: 0,
    type: "external",
  },
  {
    parentId: null,
    name: "My Requests",
    nameAr: "طلباتي",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scroll-text-icon lucide-scroll-text"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>`,
    link: "/my-requests",
    isGroup: false,
    isActive: true,
    disabled: false,
    order: 1,
    type: "external",
  },
  {
    parentId: null,
    name: "My Tasks",
    nameAr: "مهامي",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list-icon lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>`,
    link: "/my-tasks",
    isGroup: false,
    isActive: true,
    disabled: false,
    order: 2,
    type: "external",
  },
  {
    parentId: null,
    name: "My Payments",
    nameAr: "مدفوعاتي",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-credit-card-icon lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
    link: "/my-payments",
    isGroup: false,
    isActive: true,
    disabled: false,
    order: 3,
    type: "external",
  },
  {
    parentId: null,
    name: "Settings",
    nameAr: "الإعدادات",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-icon lucide-settings"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>`,
    link: "/settings",
    isGroup: false,
    isActive: true,
    disabled: false,
    order: 4,
    type: "external",
  },
];

const internalMenus: Omit<Menu, "id" | "createdAt" | "updatedAt">[] = [
  {
    parentId: null,
    name: "Dashboard",
    nameAr: "لوحة التحكم",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-dashboard-icon lucide-layout-dashboard"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
    link: "/dashboard",
    isGroup: false,
    isActive: true,
    disabled: false,
    order: 0,
    type: "internal",
  },
  {
    parentId: null,
    name: "My Tasks",
    nameAr: "مهامي",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list-icon lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>`,
    link: "/my-tasks",
    isGroup: false,
    isActive: true,
    disabled: false,
    order: 1,
    type: "internal",
  },
  {
    parentId: null,
    name: "Exams",
    nameAr: "الامتحانات",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open-check-icon lucide-book-open-check"><path d="M12 21V7"/><path d="m16 12 2 2 4-4"/><path d="M22 6V4a1 1 0 0 0-1-1h-5a4 4 0 0 0-4 4 4 4 0 0 0-4-4H3a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h6a3 3 0 0 1 3 3 3 3 0 0 1 3-3h6a1 1 0 0 0 1-1v-1.3"/></svg>`,
    link: "/exam",
    isGroup: false,
    isActive: true,
    disabled: false,
    order: 2,
    type: "internal",
  },
  {
    parentId: null,
    name: "Exam slot",
    nameAr: "مواعيد الامتحانات",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-between-vertical-start-icon lucide-between-vertical-start"><rect width="7" height="13" x="3" y="8" rx="1"/><path d="m15 2-3 3-3-3"/><rect width="7" height="13" x="14" y="8" rx="1"/></svg>`,
    link: "/exam-slot",
    isGroup: false,
    isActive: true,
    disabled: false,
    order: 3,
    type: "internal",
  },
  {
    parentId: null,
    name: "Settings",
    nameAr: "الإعدادات",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-icon lucide-settings"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>`,
    link: "/settings",
    isGroup: false,
    isActive: true,
    disabled: false,
    order: 4,
    type: "internal",
  },
];

export const seedMenus = async () => {
  console.log("Seeding menus...");

  await db.insert(menu).values([...externalMenus, ...internalMenus]);

  await db
    .insert(menu)
    .values({
      parentId: null,
      name: "Dashboard",
      nameAr: "لوحة التحكم",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-dashboard-icon lucide-layout-dashboard"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
      link: "/dashboard",
      isGroup: false,
      isActive: true,
      disabled: false,
      order: 0,
      type: "admin",
    })
    .returning({ id: menu.id });

  const platformId = await db
    .insert(menu)
    .values({
      parentId: null,
      name: "Platform",
      nameAr: "المنصة",
      icon: null,
      link: null,
      isGroup: true,
      isActive: true,
      disabled: false,
      order: 1,
      type: "admin",
    })
    .returning({ id: menu.id })
    .then((r) => r[0]?.id);

  await db.insert(menu).values([
    {
      parentId: platformId,
      name: "Organization",
      nameAr: "المنظمات",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-castle-icon lucide-castle"><path d="M10 5V3"/><path d="M14 5V3"/><path d="M15 21v-3a3 3 0 0 0-6 0v3"/><path d="M18 3v8"/><path d="M18 5H6"/><path d="M22 11H2"/><path d="M22 9v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9"/><path d="M6 3v8"/></svg>`,
      link: "/platform/organization",
      isGroup: false,
      isActive: true,
      disabled: false,
      order: 0,
      type: "admin",
    },
    {
      parentId: platformId,
      name: "Department",
      nameAr: "الأقسام",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building2-icon lucide-building-2"><path d="M10 12h4"/><path d="M10 8h4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/></svg>`,
      link: "/platform/departments",
      isGroup: false,
      isActive: true,
      disabled: false,
      order: 1,
      type: "admin",
    },
    {
      parentId: platformId,
      name: "Services",
      nameAr: "الخدمات",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mouse-pointer-click-icon lucide-mouse-pointer-click"><path d="M14 4.1 12 6"/><path d="m5.1 8-2.9-.8"/><path d="m6 12-1.9 2"/><path d="M7.2 2.2 8 5.1"/><path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"/></svg>`,
      link: "/platform/services",
      isGroup: false,
      isActive: true,
      disabled: false,
      order: 2,
      type: "admin",
    },
    {
      parentId: platformId,
      name: "Settings",
      nameAr: "الإعدادات",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings2-icon lucide-settings-2"><path d="M14 17H5"/><path d="M19 7h-9"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>`,
      link: "/platform/settings",
      isGroup: false,
      isActive: true,
      disabled: false,
      order: 3,
      type: "admin",
    },
  ]);

  const workspaceId = await db
    .insert(menu)
    .values({
      parentId: null,
      name: "Workspace",
      nameAr: "مساحة العمل",
      icon: null,
      link: null,
      isGroup: true,
      isActive: true,
      disabled: false,
      order: 2,
      type: "admin",
    })
    .returning({ id: menu.id })
    .then((r) => r[0]?.id);

  await db.insert(menu).values([
    {
      parentId: workspaceId,
      name: "Users",
      nameAr: "المستخدمون",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users-icon lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>`,
      link: "/workspaces/users",
      isGroup: false,
      isActive: true,
      disabled: false,
      order: 0,
      type: "admin",
    },
    {
      parentId: workspaceId,
      name: "Companies",
      nameAr: "الشركات",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building-icon lucide-building"><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M12 6h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/><path d="M8 6h.01"/><path d="M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/><rect x="4" y="2" width="16" height="20" rx="2"/></svg>`,
      link: "/workspaces/companies",
      isGroup: false,
      isActive: true,
      disabled: false,
      order: 1,
      type: "admin",
    },
  ]);

  const otherId = await db
    .insert(menu)
    .values({
      parentId: null,
      name: "Other",
      nameAr: "أخرى",
      icon: null,
      link: null,
      isGroup: true,
      isActive: true,
      disabled: false,
      order: 3,
      type: "admin",
    })
    .returning({ id: menu.id })
    .then((r) => r[0]?.id);

  await db.insert(menu).values([
    {
      parentId: otherId,
      name: "Settings",
      nameAr: "الإعدادات",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-icon lucide-settings"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>`,
      link: "/settings",
      isGroup: false,
      isActive: true,
      disabled: false,
      order: 0,
      type: "admin",
    },
  ]);

  console.log("Menus seeded successfully!");
};

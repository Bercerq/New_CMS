import { ProtectedRoutes } from "@utils/enums/routes";
import { Icons } from "./icon";

export const MenuItem = [
  {
    name: "Home Page",
    path: ProtectedRoutes.DASHBOARD,
    icon: Icons.DashboardIcon,
    itemId: 1,
  },
  {
    name: "Users",
    icon: Icons.UsersIcon,
    itemId: 2,
    path: ProtectedRoutes.USERS,
  },
  {
    name: "Pages",
    icon: Icons.PagesIcon,
    itemId: 3,
    height: "180px",
    subitems: [
      { name: "All Pages", path: "/pages/list" },
      { name: "New Pages", path: "/Pages/add" },
      { name: "Edit Page", path: "/pagebuilder" },
    ],
  },
  {
    name: "Modules",
    icon: Icons.ModulesIcon,
    itemId: 4,
    height: "130px",
    subitems: [
      { name: "All Modules", path: "/modules/list" },
      { name: "New Module", path: "/modules/add" },
    ],
  },
  {
    name: "Groups",
    icon: Icons.GroupsIcon,
    itemId: 5,
    height: "130px",
    subitems: [
      { name: "All Groups", path: "/groups/list" },
      { name: "New Group", path: "/groups/add" },
    ],
  },
  {
    name: "Newsletter",
    icon: Icons.NewsletterIcon,
    itemId: 6,
    height: "225px",
    subitems: [
      { name: "All Letter", path: "/letter/list" },
      { name: "New Letter", path: "/letter/add" },
      { name: "New Jobs", path: "/jobs/list" },
      { name: "New Jobs", path: "/jobs/add" },
    ],
  },
  {
    name: "Webshop",
    icon: Icons.WebshopIcon,
    itemId: 7,
    height: "225px",
    subitems: [
      { name: "Categories", path: "/webshop/categories/list" },
      { name: "All Fields", path: "/webshop/fields/list" },
      { name: "All Items", path: "/webshop/items/list" },
      { name: "All Orders", path: "/webshop/orders/list" },
    ],
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Icons.SettingsIcon,
    itemId: 8,
  },
];

export const style = {
  backgroundColor: "#f03254",
  color: "white",
};

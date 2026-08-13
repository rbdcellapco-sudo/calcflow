import { Home, LayoutGrid, Search, Bookmark, History, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/search", label: "Search", icon: Search },
  { href: "/favorites", label: "Favorites", icon: Bookmark },
  { href: "/history", label: "History", icon: History },
];

export const settingsItem: NavItem = { href: "/settings", label: "Settings", icon: Settings };

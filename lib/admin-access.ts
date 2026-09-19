export const adminRoles = ["boss", "shopmanager", "frame", "carpenter"] as const;

export type AdminRole = (typeof adminRoles)[number];

export function getHomeRouteForRole(role: AdminRole | string | null | undefined): string {
  switch (role) {
    case "boss":
      return "/admin";
    case "shopmanager":
      return "/admin/shop-manager";
    case "frame":
      return "/admin/frame";
    case "carpenter":
      return "/admin/carpenter";
    default:
      return "/admin/login";
  }
}

export function isRouteAllowedForRole(role: AdminRole | string | null | undefined, pathname: string): boolean {
  if (!role) {
    return false;
  }

  if (pathname === "/admin/login") {
    return true;
  }

  if (role === "boss") {
    return pathname.startsWith("/admin") && pathname !== "/admin/login";
  }

  if (pathname.startsWith("/admin/settings")) {
    return false;
  }

  if (role === "shopmanager") {
    return (
      pathname === "/admin" ||
      pathname === "/admin/orders" ||
      pathname.startsWith("/admin/orders/") ||
      pathname === "/admin/shop-manager" ||
      pathname.startsWith("/admin/shop-manager/") ||
      pathname === "/admin/reports" ||
      pathname.startsWith("/admin/reports/") ||
      pathname === "/admin/frame" ||
      pathname.startsWith("/admin/frame/") ||
      pathname === "/admin/carpenter" ||
      pathname.startsWith("/admin/carpenter/")
    );
  }

  if (role === "frame") {
    return pathname === "/admin/frame" || pathname.startsWith("/admin/frame/");
  }

  if (role === "carpenter") {
    return pathname === "/admin/carpenter" || pathname.startsWith("/admin/carpenter/");
  }

  return false;
}

export function getAllowedNavItems(role: AdminRole | string | null | undefined) {
  const baseItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "New Order", href: "/admin/orders" },
    { label: "Manager", href: "/admin/shop-manager" },
    { label: "Carpenter", href: "/admin/carpenter" },
    { label: "Frame", href: "/admin/frame" },
    { label: "Reports", href: "/admin/reports" },
    { label: "Settings", href: "/admin/settings/change-password" },
    { label: "Users", href: "/admin/settings/users" },
  ];

  switch (role) {
    case "boss":
      return baseItems;
    case "shopmanager":
      return baseItems.filter((item) => !item.href.startsWith("/admin/settings"));
    case "frame":
      return [{ label: "Frame", href: "/admin/frame" }];
    case "carpenter":
      return [{ label: "Carpenter", href: "/admin/carpenter" }];
    default:
      return [];
  }
}

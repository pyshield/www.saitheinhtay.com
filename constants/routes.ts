export const ROUTES = {
  HOME: 'home',
  DASHBOARD: 'dashboard',
  PORTFOLIO: 'portfolio',
  TRANSACTIONS: 'transactions',
  INVESTMENTS: 'investments',
  CRYPTO: 'crypto',
  REPORTS: 'reports',
  STATEMENTS: 'statements',
  PLANNING: 'planning',
  BLOG: 'blog',
  PROJECTS: 'projects',
  CONTACT: 'contact',
} as const;

export type RouteKey = typeof ROUTES[keyof typeof ROUTES];

export const ROUTE_LABELS: Record<RouteKey, string> = {
  [ROUTES.HOME]: 'Home',
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.PORTFOLIO]: 'Portfolio',
  [ROUTES.TRANSACTIONS]: 'Transactions',
  [ROUTES.INVESTMENTS]: 'Investments',
  [ROUTES.CRYPTO]: 'Crypto',
  [ROUTES.REPORTS]: 'Reports',
  [ROUTES.STATEMENTS]: 'Statements',
  [ROUTES.PLANNING]: 'Planning',
  [ROUTES.BLOG]: 'Blog',
  [ROUTES.PROJECTS]: 'Projects',
  [ROUTES.CONTACT]: 'Contact',
};

export const MAIN_ROUTES = [
  ROUTES.HOME,
  ROUTES.DASHBOARD,
  ROUTES.PORTFOLIO,
  ROUTES.TRANSACTIONS,
  ROUTES.INVESTMENTS,
  ROUTES.CRYPTO,
  ROUTES.REPORTS,
  ROUTES.STATEMENTS,
  ROUTES.PLANNING,
] as const;

export const FOOTER_ROUTES = [
  ROUTES.BLOG,
  ROUTES.PROJECTS,
  ROUTES.CONTACT,
] as const;

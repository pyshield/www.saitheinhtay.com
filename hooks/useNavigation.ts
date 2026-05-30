import { useState, useEffect, useCallback } from 'react';
import { ROUTES, RouteKey } from '../constants';

function isValidRoute(tab: string): tab is RouteKey {
  return Object.values(ROUTES).includes(tab as RouteKey);
}

function getInitialRoute(): RouteKey {
  try {
    if (typeof window === 'undefined') return ROUTES.HOME;
    if (window.location.protocol === 'blob:' || window.location.href.startsWith('blob:')) {
      return ROUTES.HOME;
    }
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    return tab && isValidRoute(tab) ? tab : ROUTES.HOME;
  } catch {
    return ROUTES.HOME;
  }
}

export function useNavigation() {
  const [activeTab, setActiveTab] = useState<RouteKey>(getInitialRoute);

  const updateTab = useCallback((newTab: RouteKey) => {
    if (!isValidRoute(newTab)) return;
    setActiveTab(newTab);

    try {
      if (window.location.protocol === 'blob:' || window.location.href.startsWith('blob:')) {
        return;
      }
      const url = `${window.location.pathname}?tab=${newTab}`;
      window.history.pushState({ tab: newTab }, '', url);
    } catch (error) {
      console.warn('Failed to update navigation state:', error);
    }
  }, []);

  useEffect(() => {
    try {
      if (window.location.protocol === 'blob:' || window.location.href.startsWith('blob:')) {
        return;
      }

      const handlePopState = () => {
        try {
          const params = new URLSearchParams(window.location.search);
          const tab = params.get('tab');
          if (tab && isValidRoute(tab)) {
            setActiveTab(tab);
          }
        } catch {
          // Ignore errors
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    } catch {
      // Ignore errors
    }
  }, []);

  return { activeTab, setActiveTab: updateTab };
}

// ==============================================================================
// SKILLNEXUS AI - THEME MANAGEMENT SYSTEM (LIGHT MODE ONLY)
// ==============================================================================

export const getTheme = () => {
  return 'light';
};

export const getResolvedTheme = () => {
  return 'light';
};

export const setTheme = () => {
  if (typeof window === 'undefined') return 'light';
  localStorage.setItem('skillnexus_theme', 'light');
  
  const root = document.documentElement;
  root.setAttribute('data-theme', 'light');
  root.setAttribute('data-theme-preference', 'light');
  root.classList.add('light');
  root.classList.remove('dark');

  window.dispatchEvent(new CustomEvent('nexus_theme_changed', { 
    detail: { 
      theme: 'light', 
      preference: 'light' 
    } 
  }));
  
  return 'light';
};

export const toggleTheme = () => {
  return setTheme('light');
};

let systemMediaListener = null;

export const initTheme = () => {
  const initial = getTheme();
  setTheme(initial);

  if (typeof window !== 'undefined' && window.matchMedia && !systemMediaListener) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemMediaListener = (e) => {
      if (getTheme() === 'system') {
        setTheme('system');
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', systemMediaListener);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(systemMediaListener);
    }
  }

  return initial;
};

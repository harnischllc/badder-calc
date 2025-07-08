import { useEffect } from 'react';

export const useURLParams = (salary, war) => {
  // Load params on mount
  const loadFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      salary: params.get('salary') || '',
      war: params.get('war') || ''
    };
  };

  // Update URL when values change
  useEffect(() => {
    const params = new URLSearchParams();
    if (salary) params.set('salary', salary);
    if (war) params.set('war', war);
    
    const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newURL);
  }, [salary, war]);

  return { loadFromURL };
};

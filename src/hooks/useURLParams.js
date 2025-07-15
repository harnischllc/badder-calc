import { useEffect, useRef } from 'react';

export const useURLParams = (salary, war) => {
  const previousParams = useRef({ salary: '', war: '' });
  
  // Load params on mount
  const loadFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      salary: params.get('salary') || '',
      war: params.get('war') || ''
    };
  };

  // Update URL when values change - with performance optimization
  useEffect(() => {
    // Only update if values actually changed
    if (previousParams.current.salary === salary && previousParams.current.war === war) {
      return;
    }
    
    // Update the ref
    previousParams.current = { salary, war };
    
    // Debounce URL updates
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      if (salary) params.set('salary', salary);
      if (war) params.set('war', war);
      
      const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', newURL);
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [salary, war]);

  return { loadFromURL };
};

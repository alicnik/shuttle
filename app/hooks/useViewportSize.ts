import * as React from 'react';

export const useViewportSize = () => {
  const [screenSize, setScreenSize] = React.useState({
    width: typeof window === 'undefined' ? null : window.innerWidth,
    height: typeof window === 'undefined' ? null : window.innerHeight,
  });

  React.useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return screenSize;
};

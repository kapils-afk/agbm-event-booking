import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Wraps route content with a subtle fade/slide-in animation on each navigation,
 * and resets scroll position to the top for a clean page transition.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayKey, setDisplayKey] = useState(location.pathname);

  useEffect(() => {
    setDisplayKey(location.pathname + location.search);
    // Only reset scroll when there's no in-page hash target
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [location.pathname, location.search, location.hash]);

  return (
    <div key={displayKey} className="animate-page-enter">
      {children}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

// Screen size breakpoints
const breakpoints = {
  sm: 640,  // Small devices like phones
  md: 768,  // Medium devices like tablets
  lg: 1024, // Large devices like laptops
  xl: 1280, // Extra large devices like desktops
  "2xl": 1536, // Extra extra large devices
};

type Breakpoint = keyof typeof breakpoints;

/**
 * Hook to detect if the current screen width matches a breakpoint condition
 * @param query The breakpoint query (e.g. "md", "lg", "sm:md", "md:up", "lg:down")
 * @returns Boolean indicating if the condition is met
 */
export function useBreakpoint(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Function to check if the current screen width matches the query
    const checkQuery = () => {
      let match = false;
      const windowWidth = window.innerWidth;

      if (query.includes(":")) {
        const [min, max] = query.split(":");

        if (max === "up") {
          // e.g., "md:up" means md and above
          match = windowWidth >= breakpoints[min as Breakpoint];
        } else if (max === "down") {
          // e.g., "md:down" means md and below
          match = windowWidth <= breakpoints[min as Breakpoint];
        } else {
          // e.g., "sm:md" means between sm and md
          match =
            windowWidth >= breakpoints[min as Breakpoint] &&
            windowWidth < breakpoints[max as Breakpoint];
        }
      } else {
        // e.g., "md" means exactly that breakpoint range
        const nextBreakpoint = getNextBreakpoint(query as Breakpoint);
        match =
          windowWidth >= breakpoints[query as Breakpoint] &&
          (nextBreakpoint
            ? windowWidth < breakpoints[nextBreakpoint]
            : true);
      }

      setMatches(match);
    };

    // Initial check
    checkQuery();

    // Add event listener for resize
    window.addEventListener("resize", checkQuery);

    // Clean up
    return () => window.removeEventListener("resize", checkQuery);
  }, [query]);

  return matches;
}

/**
 * Helper to get the next breakpoint in the list
 */
function getNextBreakpoint(breakpoint: Breakpoint): Breakpoint | null {
  const keys = Object.keys(breakpoints) as Breakpoint[];
  const index = keys.indexOf(breakpoint);
  return index < keys.length - 1 ? keys[index + 1] : null;
}

/**
 * Component to conditionally render content based on screen size
 */
interface MediaQueryProps {
  children: React.ReactNode;
  query: string;
}

export function MediaQuery({ children, query }: MediaQueryProps) {
  const matches = useBreakpoint(query);
  return matches ? <>{children}</> : null;
}

/**
 * Component to render different content based on screen size
 */
interface ResponsiveProps {
  desktop: React.ReactNode;
  mobile: React.ReactNode;
  breakpoint?: Breakpoint;
}

export function Responsive({
  desktop,
  mobile,
  breakpoint = "md",
}: ResponsiveProps) {
  return (
    <>
      <div className={`hidden ${breakpoint}:block`}>{desktop}</div>
      <div className={`block ${breakpoint}:hidden`}>{mobile}</div>
    </>
  );
} 
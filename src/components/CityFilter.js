import React, { useRef, useEffect, useState } from 'react';

const FilterBar = () => {
  const sentinelRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 1 } // This ensures the sticky effect triggers at the right time
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);

    return () => {
      if (sentinelRef.current) observer.unobserve(sentinelRef.current);
    };
  }, []);

  return (
    <>
      {/* 🟢 Sentinel to track scroll position */}
      <div ref={sentinelRef} className="h-0" />

      {/* 🏷️ FilterBar with fixed positioning when scrolling past */}
      <div
        className={`bg-white py-4 px-6 shadow-md transition-all duration-300 z-20 ${
          isSticky ? 'fixed top-0 w-full left-0' : ''
        }`}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="flex items-center gap-2">
            <label htmlFor="city" className="text-gray-700 font-medium">
              City:
            </label>
            <select
              id="city"
              className="p-2 rounded border text-gray-700 bg-gray-50"
              disabled
            >
              <option value="dallas">Dallas</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Search suburb or field name"
            className="flex-1 p-2 border rounded bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      {/* Spacer to prevent layout shifting */}
      {isSticky && <div className="h-[80px]" />}
    </>
  );
};

export default FilterBar;
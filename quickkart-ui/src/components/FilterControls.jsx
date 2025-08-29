import React from 'react';

export default function FilterControls({ 
  filters, 
  onFilterChange, 
  availableFilters = {},
  showSearch = true,
  searchPlaceholder = "Search...",
  variant = "default" // default, compact, horizontal
}) {
  const {
    category = [],
    gender = [],
    ageCategory = [],
    priceRange = [],
    size = [],
    color = []
  } = availableFilters;

  const priceRanges = [
    { value: "", label: "All Prices" },
    { value: "0-500", label: "Under ₹500" },
    { value: "500-1000", label: "₹500 - ₹1000" },
    { value: "1000-2000", label: "₹1000 - ₹2000" },
    { value: "2000-5000", label: "₹2000 - ₹5000" },
    { value: "5000+", label: "Above ₹5000" }
  ];

  const getContainerStyles = () => {
    switch (variant) {
      case "compact":
        return "bg-white rounded-lg shadow-sm p-4 mb-6";
      case "horizontal":
        return "bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center";
      default:
        return "bg-white rounded-lg shadow-sm p-4 mb-6";
    }
  };

  const getFilterGroupStyles = () => {
    switch (variant) {
      case "horizontal":
        return "flex items-center space-x-2";
      default:
        return "mb-4";
    }
  };

  const renderFilterGroup = (key, label, options, type = "select") => {
    if (!options || options.length === 0) return null;

    const value = filters[key] || "";

    return (
      <div className={getFilterGroupStyles()}>
        <label className="text-sm font-medium text-gray-700 mr-2">
          {label}:
        </label>
        {type === "select" ? (
          <select
            value={value}
            onChange={(e) => onFilterChange(key, e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All {label}</option>
            {options.map((option) => (
              <option key={option.value || option} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <button
                key={option.value || option}
                onClick={() => onFilterChange(key, value === (option.value || option) ? "" : option.value || option)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  value === (option.value || option)
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label || option}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSearch = () => {
    if (!showSearch) return null;

    return (
      <div className={getFilterGroupStyles()}>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={filters.search || ""}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex-1"
        />
      </div>
    );
  };

  const renderClearFilters = () => {
    const hasActiveFilters = Object.values(filters).some(value => value && value !== "");
    if (!hasActiveFilters) return null;

    return (
      <button
        onClick={() => {
          const clearedFilters = {};
          Object.keys(filters).forEach(key => {
            clearedFilters[key] = "";
          });
          onFilterChange("clear", clearedFilters);
        }}
        className="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        Clear all filters
      </button>
    );
  };

  return (
    <div className={getContainerStyles()}>
      {renderSearch()}
      
      {renderFilterGroup("category", "Category", category)}
      {renderFilterGroup("gender", "Gender", gender)}
      {renderFilterGroup("ageCategory", "Age", ageCategory)}
      {renderFilterGroup("size", "Size", size)}
      {renderFilterGroup("color", "Color", color)}
      {renderFilterGroup("priceRange", "Price", priceRanges)}
      
      {variant !== "horizontal" && renderClearFilters()}
    </div>
  );
}

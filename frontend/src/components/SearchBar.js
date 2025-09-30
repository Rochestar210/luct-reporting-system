import React from 'react';

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="mb-3">
      <div className="input-group">
        <span className="input-group-text">
          <i className="bi bi-search"></i>
        </span>
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Search"
        />
      </div>
    </div>
  );
};

export default SearchBar;
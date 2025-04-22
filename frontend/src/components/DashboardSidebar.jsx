import React from 'react';
import '../css/Dashboard.css';

/**
 * Sidebar component for the Dashboard
 * Handles the rendering of section titles and sub-options (radio buttons or checkboxes)
 * Props:
 * - sections: Array of section objects (with titles and options)
 * - expandedSection: Currently open section
 * - setExpandedSection: Function to update expanded section
 * - selectedSubOption: Currently selected sub-option
 * - setSelectedSubOption: Function to update selected sub-option
 * - resetAll: Function to reset all filters and selections
 **/
function DashboardSidebar({
  sections,
  expandedSection,
  setExpandedSection,
  selectedSubOption,
  setSelectedSubOption,
  resetAll
}) {
  // When a sub-option is selected (radio), set it in the parent component state
  const handleSubOptionClick = (opt) => {
    setSelectedSubOption(opt);
  };

  const handleCheckboxToggle = (opt) => {
    const currentSelections = Array.isArray(selectedSubOption) ? selectedSubOption : [];
    const isChecked = currentSelections.includes(opt);
    const updatedSelections = isChecked
      ? currentSelections.filter(item => item !== opt)
      : [...currentSelections, opt];

    setSelectedSubOption(updatedSelections);
    resetAll(); // Reset filters when checkbox toggled
  };

  return (
    <aside className="sidebar-section">
      {/* Loop through each section (Data Quality, Performance Measures, etc.) */}
      {sections.map((section) => (
        <div key={section.title} className="sidebar-box">
          
          {/* Section Title: clicking toggles expand/collapse */}
          <h3
            onClick={() => {
              const willCollapse = expandedSection === section.title;

              if (willCollapse) {
                setExpandedSection('');
                resetAll();
                setSelectedSubOption('');
              } else {
                resetAll();
                setExpandedSection(section.title);
                setSelectedSubOption(section.title === 'Recommendations' ? [] : '');
              }
            }}
            className={expandedSection === section.title ? 'active' : ''}
          >
            {section.title}
          </h3>

          {/* If this section is expanded, show options */}
          {expandedSection === section.title && (
            <div className="sidebar-radio">
              {section.options.map(opt => {
                const isRecommendation = section.title === 'Recommendations';

                if (isRecommendation) {
                  const currentSelections = Array.isArray(selectedSubOption) ? selectedSubOption : [];
                  const isChecked = currentSelections.includes(opt);

                  return (
                    <label key={opt} className="radio-option">
                      <input
                        type="checkbox"
                        name={section.title}
                        value={opt}
                        checked={isChecked}
                        onChange={() => handleCheckboxToggle(opt)}
                      />
                      {opt}
                    </label>
                  );
                }

                // Default: radio button
                return (
                  <label key={opt} className="radio-option">
                    <input
                      type="radio"
                      name={section.title}
                      value={opt}
                      checked={selectedSubOption === opt}
                      onChange={() => handleSubOptionClick(opt)}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </aside>
  );
}

export default DashboardSidebar;

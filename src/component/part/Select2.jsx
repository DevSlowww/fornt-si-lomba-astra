import React from "react";
import Select from "react-select";

const Select2 = ({
  arrData = [],
  label,
  forInput,
  isRequired = false,
  isDisabled = false,
  errorMessage,
  showLabel = true,
  value,
  onChange,
  ...props
}) => {
  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: errorMessage ? "red" : provided.borderColor,
    }),
  };

  const options = arrData.map((item) => ({
    value: item.Value,
    label: item.Text,
  }));

  const handleChange = (selectedOption) => {
    const event = {
      target: {
        name: forInput,
        value: selectedOption ? selectedOption.value : "",
      },
    };
    onChange(event);
  };

  return (
    <div className="mb-3">
      {showLabel && (
        <label htmlFor={forInput} className="form-label fw-bold">
          {label}
          {isRequired ? <span className="text-danger"> *</span> : ""}
          {errorMessage ? (
            <span className="fw-normal text-danger"> {errorMessage}</span>
          ) : (
            ""
          )}
        </label>
      )}
      {console.log(`MASUK ${value}`)}
      <Select
        id={forInput}
        name={forInput}
        options={options}
        isDisabled={isDisabled}
        value={options.find((option) => option.value == value)}
        onChange={handleChange}
        styles={customStyles}
        {...props}
      />
    </div>
  );
};

export default Select2;

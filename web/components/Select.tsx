"use client";

import { SelectHTMLAttributes, LabelHTMLAttributes, ReactNode, useId } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  options?: Array<{ value: string; label: string }>;
  children?: ReactNode;
};

export default function Select({
  label,
  labelProps,
  options,
  children,
  className = "",
  id,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  
  const selectClasses = `flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`;
  
  const selectElement = (
    <select id={selectId} className={selectClasses} {...props}>
      {options ? options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      )) : children}
    </select>
  );
  
  if (label) {
    return (
      <label {...labelProps} className="space-y-2 block">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {selectElement}
      </label>
    );
  }
  
  return selectElement;
}

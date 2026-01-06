"use client";

import { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, useId } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
};

export default function Input({
  label,
  labelProps,
  className = "",
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  
  const inputClasses = `flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`;
  
  if (label) {
    return (
      <label {...labelProps} className="space-y-2 block">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <input id={inputId} className={inputClasses} {...props} />
      </label>
    );
  }
  
  return <input id={inputId} className={inputClasses} {...props} />;
}

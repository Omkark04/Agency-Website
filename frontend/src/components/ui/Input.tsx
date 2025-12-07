import React from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<Props> = ({ label, ...rest }) => (
  <label className="block">
    {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
    <input className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" {...rest} />
  </label>
);
export default Input;

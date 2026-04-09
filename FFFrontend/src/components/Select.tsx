import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options?: { value: string; label: string }[]; // Делаем необязательным
}

// Добавляем = [] для options
export const Select: React.FC<SelectProps> = ({ options = [], className = '', ...props }) => {
  return (
    <select className={`border p-2 rounded ${className}`} {...props}>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
};
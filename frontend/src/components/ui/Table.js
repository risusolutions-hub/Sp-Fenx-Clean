import React from 'react';

/**
 * Table component with consistent styling
 */
export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left text-sm">
        {children}
      </table>
    </div>
  );
}

/**
 * Table header
 */
export function TableHeader({ children, className = '' }) {
  return (
    <thead className={`bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-bold ${className}`}>
      {children}
    </thead>
  );
}

/**
 * Table body
 */
export function TableBody({ children, className = '' }) {
  return (
    <tbody className={`divide-y divide-slate-50 ${className}`}>
      {children}
    </tbody>
  );
}

/**
 * Table row
 */
export function TableRow({ children, className = '', onClick, hoverable = true }) {
  return (
    <tr 
      className={`${hoverable ? 'hover:bg-slate-50/40' : ''} transition-colors ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

/**
 * Table header cell
 */
export function TableHead({ children, className = '', align = 'left' }) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  return (
    <th className={`px-8 py-5 ${alignClass} ${className}`}>
      {children}
    </th>
  );
}

/**
 * Table cell
 */
export function TableCell({ children, className = '', align = 'left' }) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  return (
    <td className={`px-8 py-6 ${alignClass} ${className}`}>
      {children}
    </td>
  );
}

/**
 * Empty table state
 */
export function TableEmpty({ message = 'No data found', icon: Icon }) {
  return (
    <TableRow hoverable={false}>
      <TableCell colSpan="100" className="text-center py-12">
        <div className="flex flex-col items-center justify-center text-slate-400">
          {Icon && <Icon className="w-12 h-12 mb-4 opacity-50" />}
          <p className="text-sm font-medium">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default Table;

import React from "react";

export function Table({ className = "", ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto rounded-md border border-border">
      <table className={`w-full caption-bottom text-body ${className}`} {...props} />
    </div>
  );
}

export function TableHeader({ className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`border-b border-border bg-background ${className}`} {...props} />;
}

export function TableBody({ className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props} />;
}

export function TableRow({ className = "", ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`border-b border-border transition-colors hover:bg-background/50 data-[state=selected]:bg-background ${className}`}
      {...props}
    />
  );
}

export function TableHead({ className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`h-36 px-12 text-left align-middle font-medium text-text-secondary [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    />
  );
}

export function TableCell({ className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`p-12 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    />
  );
}

import Image from "next/image";
import { cn } from "@/lib/utils";

type Cell = React.ReactNode | null;

export function AdminTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: (Cell | { img: string; alt?: string } | string)[][];
}) {
  const renderCell = (cell: Cell | { img: string; alt?: string } | string) => {
    if (cell && typeof cell === "object" && "img" in cell) {
      return (
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-soft-gray/50">
          <Image
            src={cell.img}
            alt={cell.alt ?? ""}
            fill
            className="object-cover"
            sizes="44px"
          />
        </div>
      );
    }
    if (typeof cell === "string") {
      const isColor = /text-(amber|red|emerald)-600/.test(cell);
      if (isColor) {
        return <span className={cn("text-sm", cell)}>{cell}</span>;
      }
      return cell;
    }
    return cell;
  };

  return (
    <div className="overflow-x-auto border border-obsidian/10 bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-obsidian/10 text-left">
            {columns.map((c) => (
              <th key={c} className="admin-th py-3 pl-5 pr-4 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-obsidian/8 last:border-0 hover:bg-obsidian/[0.02]">
              {r.map((cell, j) => (
                <td key={j} className="py-3 pl-5 pr-4">
                  {renderCell(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
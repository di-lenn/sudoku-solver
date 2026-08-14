import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          Sudoku Solver
        </Link>
        <nav className="flex items-center gap-4">
          {/* Links land here as more routes exist */}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}

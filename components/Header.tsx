import { Atom } from "lucide-react";

const Header = () => {
  return (
    <header className="h-16 flex items-center px-6 border-b border-zinc-200 bg-white shrink-0">
      <div className="flex items-center gap-2.5">
        <Atom className="w-5 h-5 text-indigo-500" strokeWidth={2} />
        <span className="text-base font-semibold tracking-tight text-zinc-900">
          Atoms Generator
        </span>
      </div>
    </header>
  );
};

export default Header;

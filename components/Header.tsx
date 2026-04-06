import { Atom, Plus } from "lucide-react";

interface HeaderProps {
  hasResult?: boolean;
  onReset?: () => void;
}

const Header = ({ hasResult, onReset }: HeaderProps) => {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-zinc-100 bg-white shrink-0 z-20 relative">
      <div className="flex items-center gap-2">
        <Atom className="w-5 h-5 text-indigo-500" strokeWidth={2} />
        <span className="text-sm font-semibold tracking-tight text-zinc-900">
          Atoms Generator
        </span>
      </div>

      {/* 有结果时显示"新建"按钮，回到初始状态 */}
      {hasResult && onReset && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          新建
        </button>
      )}
    </header>
  );
};

export default Header;

import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";

export const Header = ({ handleClear }: { handleClear: () => void }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-between mb-6">
      <div
        className="flex items-center space-x-4 cursor-pointer"
        onClick={() => handleClear()}
      >
        {/* Nexus Logo */}
        <img src="/nexus-icon.png" alt="Nexus Logo" className="h-8 w-8" />

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center space-x-2">
          <span>NEXUS -</span>
          {/* DBAT Logo */}
          <span className="flex items-center space-x-1">
            <span className="mr-2">DBAT</span>
          </span>
        </h1>
      </div>

      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "dark" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
        <div className="hidden sm:block"></div>
      </div>
    </div>
  );
};

"use client";

import { Button } from "@e-service/ui/components/ui/button";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from "@e-service/ui/components/ui/menu";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const ModeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem value="light" onClick={() => setTheme("light")}>
          Light
        </MenuItem>
        <MenuItem value="dark" onClick={() => setTheme("dark")}>
          Dark
        </MenuItem>
        <MenuItem value="system" onClick={() => setTheme("system")}>
          System
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};

export default ModeToggle;

export type ThemeName = "default" | "ocean" | "forest" | "sunset" | "midnight" | "lavender" | "coral" | "emerald" | "amber" | "rose" | "slate" | "violet" | "mint" | "sakura" | "storm";
export type ThemeMode = "light" | "dark";

export interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  colors: {
    light: {
      primary: string;
      primaryForeground: string;
      secondary: string;
      accent: string;
    };
    dark: {
      primary: string;
      primaryForeground: string;
      secondary: string;
      accent: string;
    };
  };
}

export const themes: Theme[] = [
  {
    name: "default",
    displayName: "Clásico",
    description: "Tema neutro y profesional",
    colors: {
      light: {
        primary: "222.2 47.4% 11.2%",
        primaryForeground: "210 40% 98%",
        secondary: "210 40% 96.1%",
        accent: "210 40% 96.1%",
      },
      dark: {
        primary: "210 40% 98%",
        primaryForeground: "222.2 47.4% 11.2%",
        secondary: "217.2 32.6% 17.5%",
        accent: "217.2 32.6% 17.5%",
      },
    },
  },
  {
    name: "ocean",
    displayName: "Océano",
    description: "Azules profundos como el mar",
    colors: {
      light: {
        primary: "217.2 91.2% 59.8%",
        primaryForeground: "0 0% 100%",
        secondary: "214.3 31.8% 91.4%",
        accent: "213.1 96.9% 87.1%",
      },
      dark: {
        primary: "217.2 91.2% 59.8%",
        primaryForeground: "222.2 47.4% 11.2%",
        secondary: "215 27.9% 16.9%",
        accent: "215 20.2% 65.1%",
      },
    },
  },
  {
    name: "forest",
    displayName: "Bosque",
    description: "Verdes naturales y frescos",
    colors: {
      light: {
        primary: "142.1 76.2% 36.3%",
        primaryForeground: "0 0% 100%",
        secondary: "138.5 76.5% 96.7%",
        accent: "141.5 84.2% 92.5%",
      },
      dark: {
        primary: "142.1 70.6% 45.3%",
        primaryForeground: "144.9 80.4% 10%",
        secondary: "144 61.5% 20%",
        accent: "144 61.5% 20%",
      },
    },
  },
  {
    name: "sunset",
    displayName: "Atardecer",
    description: "Tonos cálidos y acogedores",
    colors: {
      light: {
        primary: "24.6 95% 53.1%",
        primaryForeground: "0 0% 100%",
        secondary: "27.3 95.5% 90.6%",
        accent: "27.3 95.5% 90.6%",
      },
      dark: {
        primary: "24.6 95% 53.1%",
        primaryForeground: "20 14.3% 4.1%",
        secondary: "12 6.5% 15.1%",
        accent: "12 6.5% 15.1%",
      },
    },
  },
  {
    name: "midnight",
    displayName: "Medianoche",
    description: "Púrpuras profundos y elegantes",
    colors: {
      light: {
        primary: "262.1 83.3% 57.8%",
        primaryForeground: "0 0% 100%",
        secondary: "263.4 70% 50.4%",
        accent: "263.4 70% 50.4%",
      },
      dark: {
        primary: "263.4 70% 50.4%",
        primaryForeground: "210 40% 98%",
        secondary: "215 27.9% 16.9%",
        accent: "215 20.2% 65.1%",
      },
    },
  },
  {
    name: "lavender",
    displayName: "Lavanda",
    description: "Suaves tonos púrpura pastel",
    colors: {
      light: {
        primary: "270 91% 65%",
        primaryForeground: "0 0% 100%",
        secondary: "270 60% 95%",
        accent: "270 70% 90%",
      },
      dark: {
        primary: "270 80% 70%",
        primaryForeground: "270 20% 10%",
        secondary: "270 30% 20%",
        accent: "270 40% 25%",
      },
    },
  },
  {
    name: "coral",
    displayName: "Coral",
    description: "Rojos vibrantes y energéticos",
    colors: {
      light: {
        primary: "0 72.2% 50.6%",
        primaryForeground: "0 0% 100%",
        secondary: "0 84.2% 60.2%",
        accent: "0 84.2% 60.2%",
      },
      dark: {
        primary: "0 72.2% 50.6%",
        primaryForeground: "0 0% 100%",
        secondary: "0 62.8% 30.6%",
        accent: "0 62.8% 30.6%",
      },
    },
  },
  {
    name: "emerald",
    displayName: "Esmeralda",
    description: "Verdes brillantes y lujosos",
    colors: {
      light: {
        primary: "158 64% 52%",
        primaryForeground: "0 0% 100%",
        secondary: "158 50% 95%",
        accent: "158 60% 90%",
      },
      dark: {
        primary: "158 70% 45%",
        primaryForeground: "158 20% 8%",
        secondary: "158 30% 15%",
        accent: "158 40% 20%",
      },
    },
  },
  {
    name: "amber",
    displayName: "Ámbar",
    description: "Dorados cálidos y luminosos",
    colors: {
      light: {
        primary: "43 96% 56%",
        primaryForeground: "0 0% 100%",
        secondary: "43 80% 95%",
        accent: "43 85% 92%",
      },
      dark: {
        primary: "43 90% 50%",
        primaryForeground: "43 20% 8%",
        secondary: "43 30% 15%",
        accent: "43 40% 20%",
      },
    },
  },
  {
    name: "rose",
    displayName: "Rosa",
    description: "Rosas suaves y románticos",
    colors: {
      light: {
        primary: "346.8 77.2% 49.8%",
        primaryForeground: "0 0% 100%",
        secondary: "340.7 82.1% 52.9%",
        accent: "340.7 82.1% 52.9%",
      },
      dark: {
        primary: "346.8 77.2% 49.8%",
        primaryForeground: "0 0% 100%",
        secondary: "340.7 82.1% 52.9%",
        accent: "340.7 82.1% 52.9%",
      },
    },
  },
  {
    name: "slate",
    displayName: "Pizarra",
    description: "Grises modernos y minimalistas",
    colors: {
      light: {
        primary: "215 16% 47%",
        primaryForeground: "0 0% 100%",
        secondary: "215 20% 90%",
        accent: "215 25% 85%",
      },
      dark: {
        primary: "215 20% 65%",
        primaryForeground: "215 15% 8%",
        secondary: "215 25% 15%",
        accent: "215 30% 20%",
      },
    },
  },
  {
    name: "violet",
    displayName: "Violeta",
    description: "Púrpuras intensos y creativos",
    colors: {
      light: {
        primary: "280 70% 60%",
        primaryForeground: "0 0% 100%",
        secondary: "280 50% 95%",
        accent: "280 60% 90%",
      },
      dark: {
        primary: "280 75% 55%",
        primaryForeground: "280 20% 10%",
        secondary: "280 30% 18%",
        accent: "280 40% 22%",
      },
    },
  },
  {
    name: "mint",
    displayName: "Menta",
    description: "Verdes menta frescos y modernos",
    colors: {
      light: {
        primary: "158 64% 52%",
        primaryForeground: "0 0% 100%",
        secondary: "158 50% 95%",
        accent: "158 60% 90%",
      },
      dark: {
        primary: "158 70% 45%",
        primaryForeground: "158 20% 8%",
        secondary: "158 30% 15%",
        accent: "158 40% 20%",
      },
    },
  },
  {
    name: "sakura",
    displayName: "Sakura",
    description: "Rosas delicados inspirados en cerezos",
    colors: {
      light: {
        primary: "340 75% 60%",
        primaryForeground: "0 0% 100%",
        secondary: "340 60% 96%",
        accent: "340 70% 92%",
      },
      dark: {
        primary: "340 70% 55%",
        primaryForeground: "340 15% 10%",
        secondary: "340 25% 18%",
        accent: "340 35% 22%",
      },
    },
  },
  {
    name: "storm",
    displayName: "Tormenta",
    description: "Azules oscuros y dramáticos",
    colors: {
      light: {
        primary: "210 80% 45%",
        primaryForeground: "0 0% 100%",
        secondary: "210 40% 92%",
        accent: "210 50% 88%",
      },
      dark: {
        primary: "210 75% 50%",
        primaryForeground: "210 20% 8%",
        secondary: "210 30% 15%",
        accent: "210 40% 20%",
      },
    },
  },
];

export const applyTheme = (themeName: ThemeName, mode: ThemeMode) => {
  const theme = themes.find((t) => t.name === themeName);
  if (!theme) return;

  const root = document.documentElement;
  const colors = theme.colors[mode];

  // Aplicar colores del tema
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-foreground", colors.primaryForeground);
  root.style.setProperty("--secondary", colors.secondary);
  root.style.setProperty("--accent", colors.accent);

  // Aplicar modo dark/light
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};


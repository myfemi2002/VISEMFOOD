import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#fbf9f1",
        "surface-muted": "#f0eee6",
        primary: "#a43716",
        "primary-soft": "#c54f2c",
        secondary: "#745853",
        tertiary: "#4d6328",
        ink: "#1b1c17",
        "ink-soft": "#58423c",
        line: "#dfc0b7"
      },
      fontFamily: {
        display: ["Georgia", "Times New Roman", "serif"],
        body: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"]
      },
      boxShadow: {
        ambient: "0 12px 32px rgba(62, 39, 35, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        kiwi: "#3DC617",
        ivory: "#FFFFF2",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-debug-screens"),
  ],
} satisfies Config;

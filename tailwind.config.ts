import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        kiwi: "#3DC617",
        beige: "#F4F4EB",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
} satisfies Config;

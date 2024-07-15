import daisyui from "daisyui";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#a991f7", //purple
          secondary: "#fccb3a", //yellow
          accent: "#0cb0c2", //blue
          neutral: "#32373f", //grey
          success: "#adf7ba", //green
        },
      },
      "halloween",
      "business",
      "night",
      "corporate",
      "dark",
      "synthwave",
      "retro",
      "valentine",
      "wireframe",
      "black",
      "lemonade",
      "sunset",

      "light",
      "cupcake",
      "bumblebee",
      "emerald",
      "cyberpunk",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "acid",
      "coffee",
      "winter",
      "dim",
      "nord",
    ],
  },
};

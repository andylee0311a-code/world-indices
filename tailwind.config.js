/** @type {import('tailwindcss').Config} */
export default {
  // content 屬性非常重要：
  // 它告訴 Tailwind 在打包時，掃描底下這些路徑內的檔案。
  // 如果你在這裡漏掉了某個副檔名或路徑，你在元件中寫的 CSS Class 就不會生效。
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 在這裡你可以擴充或自訂自己的顏色、字體、間距等
      // 例如，如果你想自訂一個特定的股市綠色，可以這樣加：
      // colors: {
      //   'market-green': '#00ff00',
      // },
    },
  },
  plugins: [],
}
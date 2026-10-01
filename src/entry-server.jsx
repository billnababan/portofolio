import { renderToString } from "react-dom/server";
import App from "./App.jsx";

export { heroImageSizes } from "./assets/components/Hero.jsx";

export function render() {
  return renderToString(<App />);
}

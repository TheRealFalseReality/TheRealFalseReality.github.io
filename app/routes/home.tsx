// import type { Route } from "./+types/home";
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import App from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AquaPi AI" },
    { name: "description", content: "Welcome to AquaPi AI!" },
  ];
}

export default function Home() {
  return <App />;
}

<Router>
  <Routes>
    <Route path="/" element={<App />} />
    {/* Add other routes here */}
  </Routes>
</Router>
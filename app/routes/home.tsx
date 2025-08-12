// import type { Route } from "./+types/home";
import App from "../welcome/welcome";

export function meta({}: any) { // Changed Route.MetaArgs to any to avoid potential type issues
  return [
    { title: "AquaPi AI" },
    { name: "description", content: "Welcome to AquaPi AI!" },
  ];
}

export default function Home() {
  return <App />;
}
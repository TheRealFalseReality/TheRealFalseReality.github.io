import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("compat", "compat/CompatGuide.tsx"),
  route("compat-ai", "compat/CompatAI.tsx"),
  route("chatbot", "chatbot.tsx"),
  route("about", "routes/about.tsx"),
  route("tank-volume", "TankVolumeCalculator.tsx"),
  route("calculators", "Calculators.tsx"),
] satisfies RouteConfig;
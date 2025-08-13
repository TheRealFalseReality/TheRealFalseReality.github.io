import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("compat", "compat/CompatGuide.tsx"),
  route("compat-ai", "compat/CompatAI.tsx"),
] satisfies RouteConfig;

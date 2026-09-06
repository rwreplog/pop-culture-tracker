import { execSync } from "node:child_process";

import type { NextConfig } from "next";

import packageJson from "./package.json";

function getGitCommitSha() {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "dev";
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
    NEXT_PUBLIC_APP_COMMIT: getGitCommitSha(),
  },
};

export default nextConfig;

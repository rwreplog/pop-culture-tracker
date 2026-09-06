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

/** ISO 8601 commit date of HEAD, i.e. when the current release was made. */
function getGitCommitDate() {
  try {
    return execSync("git log -1 --format=%cI").toString().trim();
  } catch {
    return "";
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
    NEXT_PUBLIC_APP_COMMIT: getGitCommitSha(),
    NEXT_PUBLIC_APP_RELEASED_AT: getGitCommitDate(),
  },
};

export default nextConfig;

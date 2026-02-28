#!/usr/bin/env node

import { execSync } from "node:child_process";

function run(): void {
  try {
    const adbOutput: string = execSync("adb devices", {
      encoding: "utf8",
    });

    const connected: string[] = adbOutput
      .split(/\r?\n/)
      .slice(1)
      .map((line: string) => line.trim())
      .filter((line: string) => line && !line.startsWith("*"))
      .map((line: string) => line.split(/\s+/))
      .filter((parts: string[]) => parts[1] === "device")
      .map((parts: string[]) => parts[0]);

    if (connected.length === 0) {
      console.log("No USB device found. Aborting launch.");
      process.exit(1);
    }

    console.log(`Launching Expo on USB device: ${connected[0]}`);

    // Prevent Expo from launching any emulator
    execSync("EXPO_ANDROID_NO_EMULATOR=1 expo run:android", {
      stdio: "inherit",
      env: process.env,
    });

  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error";

    console.error("Error running Android on USB device:", message);
    process.exit(1);
  }
}

run();
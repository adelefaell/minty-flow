const { execSync } = require("node:child_process");

try {
  const adbOutput = execSync("adb devices", { encoding: "utf8" });

  const connected = adbOutput
    .split(/\r?\n/)
    .slice(1)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("*"))
    .map(line => line.split(/\s+/))
    .filter(parts => parts[1] === "device")
    .map(parts => parts[0]);

  if (connected.length === 0) {
    console.log("No USB device found. Aborting launch.");
    process.exit(1);
  }

  console.log(`Launching Expo on USB device: ${connected[0]}`);

  // Prevent Expo from launching any emulator
  execSync("EXPO_ANDROID_NO_EMULATOR=1 expo run:android", { stdio: "inherit", env: process.env });
} catch (err) {
  console.error("Error running Android on USB device:", err.message);
  process.exit(1);
}

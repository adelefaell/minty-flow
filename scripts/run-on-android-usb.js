const { execSync } = require("child_process");

try {
  // List connected devices
  const output = execSync("adb devices").toString();
  
  const connected = output
    .split("\n")
    .map(line => line.trim()) // Remove \r and extra spaces
    .filter(line => line && !line.startsWith("List of devices")) // Ignore header and empty lines
    .map(line => line.split(/\s+/)) // Split by any whitespace (tabs or spaces)
    .filter(parts => parts[1] === "device")
    .map(parts => parts[0]);

  console.log("Connected devices:", connected);

  if (connected.length === 0) {
    console.log("No USB device found. Aborting launch.");
    process.exit(1);
  }

  // Use the first connected device
  const deviceId = connected[0];
  console.log(`Launching Expo on device: ${deviceId}`);

  // Run expo on that specific device
  // Added { stdio: "inherit" } to see the live build logs
  execSync(`pnpx expo run:android --device ${deviceId}`, { stdio: "inherit" });

} catch (err) {
  console.error("Error running Android on USB device:", err.message);
  process.exit(1);
}
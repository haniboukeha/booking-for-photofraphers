const fs = require("fs");
let env = fs.readFileSync(".env", "utf8");
if (!env.includes("CLOUDINARY_CLOUD_NAME")) {
  env +=
    "\nCLOUDINARY_CLOUD_NAME=nf4dbrjt\n" +
    "CLOUDINARY_API_KEY=865855934413993\n" +
    "CLOUDINARY_API_SECRET=8KSpLF4bd0EyfN5owNL8bssmHDU\n";
  fs.writeFileSync(".env", env);
  console.log("cloudinary keys added to .env");
} else {
  console.log("keys already present");
}

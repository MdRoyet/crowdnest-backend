// Entry point for Render deployment
// postinstall runs "npm run build" which compiles TS to dist/
// This file loads the compiled server
require("./dist/server");

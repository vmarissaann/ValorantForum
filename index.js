// System-related packages
import "dotenv/config";
import { dirname } from "path";
import { fileURLToPath } from "url";

//Web-app related packages
import express from "express";
import exphbs from "express-handlebars";
import session from "express-session";

//Route modules
import router from "./src/routes/index.js";

//import database
import { connectToMongo } from "./src/db/conn.js";

async function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url)); // directory URL
  const app = express();

  app.use("/static", express.static(__dirname + "/public"));

  app.engine(
    "hbs",
    exphbs.engine({
      extname: "hbs",
    })
  );
  app.set("view engine", "hbs");
  app.set("views", "./src/views");
  app.set("view cache", false);

  app.use(express.json());
  app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie:{
      sameSite:"strict"
    }
  }));

  app.use(router);

  app.listen(process.env.SERVER_PORT, () => {
    console.log("Express app now listening...");
    connectToMongo((err) => {
      if (err) {
        console.error("An error has occurred:");
        console.error(err);
        return;
      }
      console.log("Connected to Mongodb");
    });
  });
}

main();

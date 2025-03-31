import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config(
    {
        path: "./env",
    }
)

connectDB().then(
    () => {
        app.on("error", (error) => {
            console.log("error while starting the app: ", error);
        })
        //listining
        app.listen(process.env.PORT || 8000, () => {
            console.log(`server is listning on port: ${process.env.PORT}`);
        })
    }
).catch(
    (err) => {
        console.log("error while connecting DB: ", err);
    }
)
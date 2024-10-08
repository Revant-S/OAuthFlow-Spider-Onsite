import "dotenv/config"
import express from "express"
import mongoose from "mongoose";
import morgan from "morgan";
import debug from "debug";
import registerRoutes from "./routers/registerroutes"
import authorizeRoutes from "./routers/authRoutes"
import resourceRoutes from "./routers/resourceRoutes"
import adminTokenRoutes from "./routers/adminToken"

const startUpDebugger = debug("app:startUpBebugger");
const errorStartUpDebugger = debug("app:errorStartUpDebugger");
const dbDebugger = debug("app:dbDebugger");
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : true}))


app.use("/registerApp" , registerRoutes);
app.use("/authorize" ,authorizeRoutes )
app.use("/resource" ,resourceRoutes )
app.use("/adminToken", adminTokenRoutes)
if (app.get("env") === "development") {
    morgan("dev")
}

const connectToDb = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/OAuth")
        dbDebugger("DataBase is Connected")
        app.listen(3000, () => startUpDebugger(`server is active on the port ${3000}`))
    } catch (error: any) {
        errorStartUpDebugger(error.message);
    }
}


connectToDb()


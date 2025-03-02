//to use import and not require write type as module in package.json
import express from "express"; //express is a backend web framework that provides lot of features on which we can build api bakcend quickly
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
//path : ./src/index.js

//import routes
import authRoutes from "./routes/auth.route.js"; //as module type write .js for local files
import reviewRoutes from "./routes/review.route.js"; 
import { connectDB } from "./lib/db.js";

dotenv.config();
const app = express();

const allowedOrigins = ["http://localhost:5173"];
app.use(
  cors({
    credentials : true,
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies/auth headers
  })
);

app.use(express.json({ limit: '50mb' }));  // Increase the limit to 50mb
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

//sample for basic route
app.get("/", (req, res) => {
  res.send("Server is running");
});

//routes added here
app.use("/api/auth", authRoutes);
app.use("/api/review", reviewRoutes);

const port = process.env.PORT;
app.listen(port, () => {
  console.log("Server is running on port no." + port);
  //first of all connect to database
  connectDB();
});

//remember for collections like users , messages,etc go to the models folder

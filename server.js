const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db");
//dot config
dotenv.config();

//mongodb connection
connectDB();

//rest object
const app = express();

//middlewares
app.use(express.json());
app.use(cors({
    origin:['http://localhost:3000'],
    methods:['GET', 'POST','PUT','DELETE'],
    credentials:true
}));

//routes
// 1 test route
app.use("/api/v1/test", require("./routes/testRoutes"));
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/inventory", require("./routes/inventoryRoutes"));
app.use("/api/v1/analytics", require("./routes/analyticsRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));

//port
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    return res.status(200).json({
        message:"hii I am arijit"
    })
})

//listen
app.listen(PORT, () => {
  console.log(
    `Node Server Running on Port ${process.env.PORT}`
      .bgBlue.white
  );
});

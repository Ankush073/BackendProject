import dotenv from "dotenv"
import connectDB from "./db/index.js"
connectDB()
dotenv.config({
      path:'./env'
})

.then(()=>{
      app.listen(process.env.port||800,()=>{
            console.log(`server listening on port:${process.env.port}`);
      })})
.catch((error)=>{
      console.log("MongoDB connection faliled",error);
})
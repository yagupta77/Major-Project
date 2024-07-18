const express = require("express");
const app = express();
const users = require("./routes/user.js")
const posts = require("./routes/post.js")
const cookieParser = require("cookie-parser");
app.use(cookieParser);


app.get("/getcookies",(req,res)=>{
    res.cookie("greeting","hello")
    res.send("sent cookies")
})
app.get("/",(req,res)=>{
    console.dir(req.cookies);
    res.send("Hi i am route")
})

app.use("/users",users)
app.use("/posts",posts)

app.listen(3000,(req,res)=>{
    console.log("server running")
})
const express = require("express");
const router = express.Router();
// const posts = require("./router/post.js")


router.get("/",(req,res)=>{
    res.send("Get for users")
})
//Show User
router.get("/:id",(req,res)=>{
    res.send("Get for users")
})
//Post route
router.get("/",(req,res)=>{
    res.send("Post for users")
});
router.get("/:id",(req,res)=>{
    res.send("Post for users")
});
module.exports = router;

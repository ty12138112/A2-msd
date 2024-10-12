const express=require("express");
const bodyParser=require("body-parser");
const path=require("path");

const app=express();

//to parse URL-encoded & JSON data
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//to serve static files
app.use(express.static(__dirname));

//route to serve index.html
app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname,"index.html"));
});


//we will add more routes here

app.listen(8181,()=>{
  console.log("Running in 8181");
});

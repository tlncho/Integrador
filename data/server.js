const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.get("/",(req,res)=>{
  res.send("Página principal")
})
app.get("/saludo",(req,res)=>{
  res.send("Holaa")
})
app.listen(3000,()=>{
console.log("Server escuchando en el puerto 3000")

});
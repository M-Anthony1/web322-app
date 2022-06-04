/***********************************************************************
**********
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Marco Schiralli     Student ID: 118649219       Date: 06/03/22
*
* Online (Heroku) Link:   https://thawing-ocean-71594.herokuapp.com/ 
*
************************************************************************
********/ 


let express = require("express");
const blog = require('./blog-service') 
let app = express();
let path = require('path');

let HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public'))



app.get("/", function(req,res){
    res.redirect(path.join("/about"))
})

app.get('/about', (req,res)=> {
    res.sendFile(path.join(__dirname,'/views/about.html'))
    
})

app.get('/blog', (req,res) => {
    // res.sendFile(path.join(__dirname,'/data/posts.json'))
    blog.getPublishedPosts().then((data) => {

        res.json(data)
    })

    .catch((err) => {

        console.log(err.message)
        res.json({message:err})
    })
 
})

app.get('/posts', (req,res) => {
    // res.sendFile(path.join(__dirname,'/data/posts.json'))
    blog.getAllPosts().then((data) => {

        res.json(data)
    })

    .catch((err) => {

        console.log(err.message)
        res.json({message:err})
    })
 
})

app.get('/categories', (req,res) => {
    // res.sendFile(path.join(__dirname,'/data/categories.json'))
    blog.getCategories().then((data) => {

        res.json(data)
    })

    .catch((err) => {

        console.log(err.message)
        res.json({message:err})
    })
 
})

// No matching route 
app.use((req, res) => {
  res.status(404).send('<h2>Looks like this page is broken, going to have to fire the intern.</h2>')})



  //initialize 
blog.initialize().then((data) => {

    app.listen(HTTP_PORT, ()=>{ console.log(`Express http server listening on port ${HTTP_PORT}`)})
}) .catch((err) => {

    console.log(err.message)
})



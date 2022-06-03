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
    res.sendFile(path.join(__dirname,'/data/posts.json'))
 
})

app.get('/posts', (req,res) => {
    res.sendFile(path.join(__dirname,'/data/posts.json'))
 
})

app.get('/categories', (req,res) => {
    res.sendFile(path.join(__dirname,'/data/categories.json'))
 
})

// No matching route 
app.use((req, res) => {
  res.status(404).send('<h2>Looks like this page is broken, going to have to fire the intern.</h2>')})



blog.initialize().then((data) => {

    app.listen(HTTP_PORT, ()=>{ console.log(`Express http server listening on port ${HTTP_PORT}`)

    })
}) .catch((error) => {

    console.log(error)
})




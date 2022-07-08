/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic
* Policy. No part Of this assignment has been copied manually or electronically from 
* any other source (including 3rd party web sites) or distributed to other students.
*
* Name: Marco Schiralli         Student ID:118649219        Date: 06/17/22
*
* Online (Heroku) Link:  https://thawing-ocean-71594.herokuapp.com
*
*
********************************************************************************/


let express = require("express")
const blog = require('./blog-service') 
let app = express()
let path = require('path')
const exphbs = require('express-handlebars')
const stripJs = require('strip-js')
const multer = require("multer")




const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const res = require("express/lib/response")
const { json } = require("express/lib/response")

let HTTP_PORT = process.env.PORT || 8080

app.use(express.static('public'))

app.engine('.hbs', exphbs.engine({ extname: '.hbs',

    helpers: {

        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
            '><a href="' + url + '">' + options.fn(this) + '</a></li>'
           },

        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters")
            if (lvalue != rvalue) {
            return options.inverse(this)
            } else {
            return options.fn(this)
            }
           },

        safeHTML: function(context){
            return stripJs(context);
         }

    }
}))

app.set('view engine', '.hbs')

cloudinary.config({
    cloud_name: 'marcoanthony',
    api_key: '191447386153542',
    api_secret: 'P_WFao22yjb1hvD7ehKXAVucqjs',
    secure: true
})

const upload = multer()


app.use(function(req,res,next){
    let route = req.path.substring(1)
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""))
    app.locals.viewingCategory = req.query.category
    next()
    
   })


   

app.get("/", function(req,res){
    res.redirect(path.join("/about"))
})

app.get('/about', (req,res)=> {
    res.render('about')
    
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

    if(req.query.category){

        blog.getPostsByCateogry(req.query.category).then((data)=>{
            res.render("posts", {posts: data})

        }).catch((err) => {
            res.render("posts", {message: "no results"})
        })
    }

    else if(req.query.minDate){

        blog.getPostsByMinDate(req.query.minDate).then((data)=>{
            res.render("posts", {posts: data})

        }).catch((err) => {
            res.render("posts", {message: "no results"})
        })
    }
    
    else  {

        blog.getAllPosts().then((data) => {
            res.render("posts", {posts: data})
    })

    .catch((err) => {

        console.log(err.message)
        res.render("posts", {message: "no results"})
     })
    }
 
})

app.get('/categories', (req,res) => {
    
    blog.getCategories().then((data) => {

        res.render("categories", {categories: data})
    })

    .catch((err) => {

        console.log(err.message)
        res.render("categories", {message: "no results"})
    })
 
})

app.get('/posts/add', (req,res) =>{
    res.render('addPost')
})

app.get('/post/:id', (req, res)=>{

    blog.getPostById(req.params.id).then((data) => {
        res.json(data)
    })

    .catch((err) => {
        console.log(err.message)
        res.json({message:err})
        })
    })

app.post('/posts/add',upload.single('featureImage'), (req,res) => {

    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
         let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
             if (result) {
                 resolve(result)
           } else {
                 reject(error)
             }
          }
        )
        streamifier.createReadStream(req.file.buffer).pipe(stream)
        })
       }

    async function upload(req) {
        let result = await streamUpload(req)
        console.log(result)
        return result
       }
       
       upload(req).then((uploaded)=> {
           
        req.body.featureImage = uploaded.url
        
        blog.addPost(req.body).then(()=> {
            
            res.redirect('/posts')
            
        })
        .catch((err) =>{
            console.log('ERROR')
        })
    
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



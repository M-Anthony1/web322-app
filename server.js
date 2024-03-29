/******************************************************************************
***
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
No part of this
* assignment has been copied manually or electronically from any other source (including web
sites) or
* distributed to other students.
*
* Name: Marco Schiralli     Student ID: 118649219    Date: 08/12/22
*
* Online (Heroku) Link:  https://thawing-ocean-71594.herokuapp.com/
*
******************************************************************************
**/ 
let express = require("express")
const authData = require("./auth-service")
const blog = require('./blog-service') 
const clientSessions = require("client-sessions");
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
app.use(express.urlencoded({extended: true}))

app.use(clientSessions({
    cookieName: "session", 
    secret: "web322_assignment6", 
    duration: 2 * 60 * 1000, 
    activeDuration: 1000 * 60 
  }))

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next()
   })

function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
  }

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
         },

         formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
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


   

app.get('/', function(req,res){
    res.redirect(path.join("/blog"))
})

app.get('/login', function(req,res) {

    res.render('login')
})

app.post('/login', (req,res) =>{

    req.body.userAgent = req.get('User-Agent')

    authData.checkUser(req.body).then((user) => {
        req.session.user = {
         userName: user.userName,
         email: user.email,
         loginHistory: user.loginHistory
        }
        res.redirect('/posts')

    }).catch((err)=>{

        res.render('login', {errorMessage: err, userName: req.body.userName})

    })


})

app.get('/register', function(req,res){
    res.render('register')
})

app.post('/register', (req,res) =>{

    authData.registerUser(req.body).then(()=>{
        res.render('register', {successMessage: 'User created'})
    })
    .catch((err)=>{
        res.render('register', {errorMessage: err, userName: req.body.userName})
    })


})


app.get('/logout', (req,res)=>{

    req.session.reset()
    res.redirect('/')
})

app.get('/userHistory', (req,res)=>{

   res.render('userHistory')
})

app.get('/about', (req,res)=> {
    res.render('about')
    
})

app.get('/blog', async (req, res) => {

  
    let viewData = {};

    try{

        let posts = [];

        if(req.query.category){
      
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        }else{
          
            posts = await blog.getPublishedPosts();
        }

      
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

    
        let post = posts[0]; 

        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        
        let categories = await blog.getCategories()

        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {

   
    let viewData = {};

    try{

        let posts = [];      
        if(req.query.category){
           
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        }else{
           
            posts = await blog.getPublishedPosts();
        }

        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
     
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
    
        viewData.post = await blog.getPostById(req.params.id)
       
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        
        let categories = await blog.getCategories();
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
    res.render("blog", {data: viewData})
});


app.get('/posts',ensureLogin, (req,res) => {

    if(req.query.category){

        blog.getPostsByCateogry(req.query.category).then((data)=>{


            if(data.length > 0){

                res.render("posts", {posts: data})
            }
            else{

                res.render("posts", {message: "no results"})

            }

        }).catch((err) => {

            console.log(err.message)
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

            if(data.length > 0){
                res.render("posts", {posts: data})
            }
            else
                res.render("posts", {message: "no results"})

    })

    .catch((err) => {

        console.log(err.message)
        res.render("posts", {message: "no results"})
     })
    }
 
})

app.get('/categories', ensureLogin, (req,res) => {
    
    blog.getCategories().then((data) => {

        if(data.length > 0){
            
            res.render("categories", {categories: data})
        }
        else{

            res.render("categories", {message: "no results"})
        }

        

    })

    .catch((err) => {

        console.log(err.message)
        
    })
 
})

app.get('/posts/add', ensureLogin, (req,res) =>{

    blog.getCategories().then((data) => {

        res.render("addPost", {categories: data});

    })
    .catch((err) => 
    res.render("addPost", {categories: []}))

})

app.get('/post/:id', ensureLogin, (req, res)=>{

    blog.getPostById(req.params.id).then((data) => {
        res.json(data)
    })

    .catch((err) => {
        console.log(err.message)
        res.json({message:err})
        })
    })

app.post('/posts/add', ensureLogin, upload.single('featureImage'), (req,res) => {

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

app.get('/categories/add', ensureLogin, (req,res) => {

    res.render('addCategory')

})

app.post('/categories/add', ensureLogin, (req,res) => {

        
        blog.addCategory(req.body).then(()=> {
            
            res.redirect('/categories')
            
        })
        .catch((err) =>{
            console.log('ERROR')
        })
    
    })

app.get('/categories/delete/:id', ensureLogin,  (req, res) => {


    blog.deleteCategoryById(req.params.id).then(() =>{

        res.redirect('/categories')
    })
    .catch(()=>{

        res.status(500).send('Unable to Remove Category / Category not found')

    })
})

app.get('/posts/delete/:id', ensureLogin, (req, res) => {


    blog.deletePostById(req.params.id).then(() =>{

        res.redirect('/posts')
    })
    .catch(()=>{

        res.status(500).send('Unable to Remove Post / Post not found')

    })
})




// No matching route 
app.use((req, res) => {
  res.status(404).send('<h2>404 Error. Failed Succesfully</h2>')})



  //initialize 
  blog.initialize()
  .then(authData.initialize)
  .then(function(){
   app.listen(HTTP_PORT, function(){
   console.log("app listening on: " + HTTP_PORT)
   })
  }).catch(function(err){
   console.log("unable to start server: " + err);
  })



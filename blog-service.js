const fs = require("fs")

var posts = [];
var categories = [];

module.exports.initialize = function () {

    return new Promise ((resolve, reject)=>{
        fs.readFile('./data/posts.json', 'utf8', (err,data) =>{

            if(err){
            reject('unable to read file')
            
            }
            {
                posts = JSON.parse(data)

        }
        })

        fs.readFile('./data/categories.json', 'utf8', (err,data) =>{

            if (err) {

                reject('unable to read file')
            }{

                categories = JSON.parse(data)
                resolve('successfully got data')
            }

        })

    })

}


module.exports.getAllPosts = function () {

    return new Promise ((resolve,reject) => {

        if(posts.length === 0){

          reject('no results returned')  
        }
        {
            resolve(posts)
        }
    })
}


module.exports.getPublishedPosts = function (){

const checkPublished = posts.filter(post => post.published === true)

    return new Promise ((resolve,reject) => {

        if(checkPublished.length === 0){

            reject('no results returned')

        }{
            resolve(checkPublished)
        }
    })
}


module.exports.getCategories = function () {

    return new Promise ((resolve, reject) =>{

        if(categories.length === 0){

            reject('no results returned')
        } {
            resolve (categories)
        }
    })

}





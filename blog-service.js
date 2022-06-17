const fs = require("fs")

let posts = [];
let categories = [];

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

module.exports.addPost = function (postData) {

    return new Promise((resolve,reject) =>{

        if(postData.published === undefined){
            postData.published = false
        }
        {
            postData.published = true
        }


        postData.id = posts.length + 1;
        posts.push(postData)
        resolve(postData)
    })
}


module.exports.getPostsByCateogry = function (category) {

    return new Promise((resolve, reject) => {

        const filterCategory = posts.filter(postData => postData.category == category);

        if (filterCategory.length !== 0) {
            resolve(filterCategory);
        }
        
        reject('No results returned');
        
      })

}

module.exports.getPostsByMinDate = function (minDateStr) {

    let filterDate = [];

    return new Promise((resolve, reject) => {

        posts.forEach(postData => {     
            if(new Date(postData.postDate) >= new Date(minDateStr)){
                filterDate.push(postData);
            }
        })

        if(filterDate.length !== 0){

            resolve(filterDate);
        }
        reject('No results returned')
    })
}


module.exports.getPostById = function (id) {

    return new Promise((resolve, reject) => {

        const filterId = posts.filter(postData => postData.id == id);

        if (filterId.length !== 0) {
            resolve(filterId);
        }
        
        reject('No results returned');
        
      })


}




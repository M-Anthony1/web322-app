const Sequelize = require ('sequelize')

var sequelize = new Sequelize('da5busa5dhniea', 'rnyilxbyvyzrtc', '97b00f8fa5de57ab99cadcb59ba2d4433164477657b91724c982f2a40dd6c099', {
    host: 'ec2-34-200-35-222.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
   });


var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category',{
    category: Sequelize.STRING
})

Post.belongsTo(Category, {foreignKey: 'category'});


module.exports.initialize = function () {

    return new Promise((resolve, reject) => {

    sequelize.sync().then(() => {
        
    resolve(console.log('Succesfully connected to the database'))

    })

    .catch(()=> {

        {reject(console.log('unable to sync the database'))}
    })  
   

    })

}


module.exports.getAllPosts = function () {

    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {

            Post.findAll().then(function(data){
                resolve(data)
            })
            .catch(() => {reject('no results returned')})
        })
    })
}


module.exports.getPublishedPosts = function (){

    return new Promise((resolve, reject) => {

        sequelize.sync().then(() => {

            Post.findAll({where : {published: true}})
            .then(function(data){

                resolve(data)
            })
            .catch(() => 
            {reject(console.log('No results returned'))})
            
        })
       });
}


module.exports.getPublishedPostsByCategory = function(category){


    return new Promise((resolve, reject) => {


        sequelize.sync().then(() => {
            Post.findAll({where:{published:true, category:category}})
            .then(function(data){

                resolve(data)
            })
            .catch(() => 
            {reject(console.log('No results returned'))})
        })
       });

}


module.exports.getCategories = function () {

    return new Promise((resolve, reject) => {


        sequelize.sync().then(function(){

            Category.findAll()
            .then(function(data){

                resolve(data)
            })
            .catch(() => 
            {reject(console.log('no results returned'))})

        })
    
       });

   
}

module.exports.addPost = function (postData) {
    
    postData.published = (postData.published) ? true : false;
    for(const atr in postData){
        
        if(postData[atr] == ""){
            postData[atr] = null
        }
    }
    
    postData.postDate = new Date()
    
    return new Promise((resolve, reject) => { 
    sequelize.sync().then(function(){

        Post.create(postData)
        .then(resolve('Success, Post was added!'))
        .catch(()=>
        {reject(console.log('unable to create post'))})
     })
   
    });
}


module.exports.getPostsByCateogry = function (category) {

    return new Promise((resolve, reject) => {

        sequelize.sync().then(function (){

            Post.findAll({where : {category:category}})
            
            .then((data) => {
                resolve(data)
            })
            .catch(() => {reject(console.log('no results returned'))})
            })
        })
}

module.exports.getPostsByMinDate = function (minDateStr) {

    return new Promise((resolve, reject) => {

        const { gte } = Sequelize.Op;
        sequelize.sync().then(function(){

       Post.findAll({
                where: {
                    postDate: {
                        [gte]: new Date(minDateStr)
                    }
                }
            })
            .then(function(data){
                resolve(data)
            })
            .catch(() => {reject(console.log('no results returned'))})
        });
    })
}


module.exports.getPostById = function (id) {

  return new Promise((resolve, reject) => {

    sequelize.sync().then(function(){
        Post.findAll({where:{id:id}})
        .then((data) => {

            resolve(data[0])
        })
        .catch(() => 
        {reject(console.log('no results returned'))})
        
     })
    });
}

module.exports.addCategory = function (categoryData){

    return new Promise((resolve, reject) => { 
  
            for(var atr in categoryData){

                if(categoryData[atr] == ""){

                    categoryData[atr] = null
                }
            }
        
        sequelize.sync().then(function(){

            Category.create(categoryData).then(resolve(console.log('Category was created')))
            .catch(() => {reject('unable to create category')})
        })

    }

)}

module.exports.deleteCategoryById = function (id){

    return new Promise((resolve, reject)=>{

        Category.destroy({where:{ id: id}})
        .then(() => resolve(console.log('destroyed')))
        .catch(() => reject('task rejected'))

    })
}

module.exports.deletePostById = function (id){

    return new Promise((resolve, reject)=>{

        Post.destroy({where:{id: id}})
        .then(() => resolve(console.log('destroyed')))
        .catch(() => reject('task rejected'))

    })
}




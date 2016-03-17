var express = require("express");
var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/basic_dashboard');
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded());
var path = require("path");
app.use(express.static(__dirname + "./static"));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
var validate = require('mongoose-validator');

var nameValidator = [
  validate({
    validator: 'isLength',
    arguments: 4,
    message: 'Name should be at least 4 characters'
  })
]


var Schema = mongoose.Schema

var PostSchema = new mongoose.Schema({
 name: {type: String ,validate: nameValidator},
 post: String,
 comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
});

var CommentSchema = new mongoose.Schema({
  name: {type: String, validate: nameValidator},
  comment: String,
 _post: {type: Schema.Types.ObjectId, ref: 'Post'},
 created_at: {type: Date, default: new Date}
});

PostSchema.path('name').required(true, 'Name cannot be blank');
PostSchema.path('post').required(true, 'Post cannot be blank');


CommentSchema.path('comment').required(true, 'Comment cannot be blank');
CommentSchema.path('name').required(true, 'Name cannot be blank');


mongoose.model('Post', PostSchema);
mongoose.model('Comment', CommentSchema);

var Post = mongoose.model('Post')
var Comment = mongoose.model('Comment')

app.get('/', function(req,res){
  Post.find({}).populate('comments').exec(function(err, posts){
         // console.log(posts.comments)
         res.render('index', {posts: posts})
        })
})

  app.post('/create', function(req,res){
  console.log("POST DATA", req.body);
  var post = new Post({name: req.body.name, post: req.body.post});
  post.save(function(err){
     if(err) {
       var errors = post.errors
       Post.find({}).populate('comments').exec(function(err, posts){
          res.render('index', {title: 'you have errors!', errors: errors, posts: posts})
        })
    } else { 
      console.log('successfully added a post!');
      res.redirect('/');
    }
  })
})


app.post('/comment/:id', function(req,res){
  // console.log("Comment Data", req.body.comments);
  Post.findOne({_id: req.params.id}, function(err, post){
         var new_comment = new Comment({name:req.body.name, comment: req.body.comment});

         // console.log(post + "I am in the post.findone")
         new_comment._post = post._id;
         post.comments.push(new_comment);
         console.log("above save" + new_comment)
         new_comment.save(function(err){
            post.save(function(err2){
    if(err) { 
      // var errors = new_comment.errors
       Post.find({}).populate('comments').exec(function(err3, posts){
          res.render('index', {title: 'you have errors!', errors: new_comment.errors, posts: posts})
        })
    } else { 
      // console.log(post)
      res.redirect('/'); 
    }
   });
  });
 });
 });


app.listen(8000, function() {
    console.log("listening on port 8000");
})
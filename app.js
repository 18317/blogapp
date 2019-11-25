var express = require('express'),
  fs = require('fs'),
  app = express(),
  mongoose = require('mongoose'),
  expresssanitizer = require('express-sanitizer'),
  methodoverrride = require('method-override'),
  bodyParser = require('body-parser');
const { parseString } = require('xml2js');
const opts = {
  mergeAttrs: true
};
mongoose.connect('mongodb://localhost:27017/restful_blog_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(expresssanitizer());
app.use(methodoverrride('_method'));

//schema

var blogSchema = new mongoose.Schema({
  title: [],
  image: [],
  body: [],
  created: {
    type: Date,
    default: Date.now
  }
});
//model
var Blog = mongoose.model('Blog', blogSchema);
//initializing the database
seedDB();

//routes
//index
app.get('/', function(req, res) {
  res.redirect('/blogs');
});

app.get('/blogs', function(req, res) {
  Blog.find({}, function(err, blogs) {
    if (err) {
      console.log('error');
    } else {
      res.render('index', {
        blogs: blogs
      });
    }
  });
});
//new
app.get('/blogs/new', function(req, res) {
  res.render('new');
});
//create
app.post('/blogs', function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog, function(err, newBlog) {
    if (err) {
      res.render('new');
    } else {
      res.redirect('/blogs');
    }
  });
});
//show
app.get('/blogs/:id', function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.render('show', {
        blog: foundBlog
      });
    }
  });
});
//edit
app.get('/blogs/:id/edit', function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.render('edit', {
        blog: foundBlog
      });
    }
  });
});

//update
app.put('/blogs/:id', function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(
    err,
    updatedblog
  ) {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.redirect('/blogs/' + req.params.id);
    }
  });
});
//destroy
app.delete('/blogs/:id', function(req, res) {
  //destroy blog
  Blog.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.redirect('/blogs');
    }
  });
});
app.listen(3000, function() {
  console.log('server is running');
});

function seedDB() {
  //reading xml file to seed the database
  fs.readFile('./data.xml', function(err, data) {
    var xml = data;
    parseString(xml, opts, function(err, res) {
      //creating data variable which will be used to loop through and store all campgrounds in database
      data = res.blogs.blog;
      console.log(JSON.stringify(data));

      //Removing blogs
      Blog.remove({}, function(err) {
        if (err) {
          console.log(err);
        }
        console.log('removed blogs!');
        //add a few campgrounds
        data.forEach(function(seed) {
          Blog.create(seed, function(err, campground) {
            if (err) {
              console.log(err);
            } else {
              console.log('added a blog');
            }
          });
        });
      });
    });
  });
}

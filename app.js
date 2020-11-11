const { authenticate } = require('passport');

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    Place = require('./models/place'),
    Comment = require('./models/comment'),
    User = require('./models/user'),
    seedDB = require('./seeds');

seedDB();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

// passport configuration
app.use(require('express-session')({
    secret: 'I am timothy',
    resave: false,
    saveUninitialized: false 
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//connect mongoose
mongoose.connect('mongodb://localhost/demo_iranTrip',  { useNewUrlParser: true, useUnifiedTopology: true } ,err => {
    console.log('mongoose connected');
});

// middleware
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    res.send('not login!');
}

//create place
// Place.create(
//     {
//         name: 'Tehran', 
//         image: 'https://ifpnews.com/wp-content/uploads/2018/10/tehran-1200x798.jpg'   
//     },
//     {
//         name: 'Isfahan', 
//         image: 'https://www.letsvisitpersia.com/wp-content/uploads/2019/12/must-see-in-isfahan.jpg'
//     },
//     {
//         name: 'Shiraz', 
//         image: 'https://s25910.pcdn.co/wp-content/uploads/2018/02/Pink-Mosque-Things-To-Do-In-Shiraz.jpg'
//     }, function(err, place){
//         if (err){
//             console.log(err);
//         } else {
//             console.log('place created');
//             console.log(place);
//         }
//     }
// );

// var places = [
//     {name: 'Tehran', image: 'https://ifpnews.com/wp-content/uploads/2018/10/tehran-1200x798.jpg'},
//     {name: 'Isfahan', image: 'https://www.letsvisitpersia.com/wp-content/uploads/2019/12/must-see-in-isfahan.jpg'},
//     {name: 'Shiraz', image: 'https://s25910.pcdn.co/wp-content/uploads/2018/02/Pink-Mosque-Things-To-Do-In-Shiraz.jpg'}
// ];

app.get('/', function(req, res){
    res.render('opening');
})

// Index-R
app.get('/places', function (req, res){
    // get all places from db
    Place.find({}, function(err, allPlaces){
        if (err){
            console.log(err);
        } else {
            res.render('places/index', {places: allPlaces, currentUser: req.user});
        }
    })
});

// Create-R
app.post('/places', function (req, res){
    // get data from form and add to places array
    var name = req.body.name;
    var image = req.body.image;
    var newPlace = {name: name, image: image}
    // places.push(newPlace);
    // create new place and update to data base
    Place.create(newPlace, function(err, newPlaceCreated){
        if (err){
            console.log(err);
        } else {
            // redirect places page
            res.redirect('/places');
        }
    });
});

//New-R
app.get('/places/new', function (req, res) {
   res.render('places/new'); 
});

//Show-R
app.get('/places/:id', function(req, res){
    Place.findById(req.params.id).populate('comments').exec(function(err, foundPlace){
        if (err){
            console.log(err);
        } else {
            console.log(foundPlace)
            res.render('places/show', {place: foundPlace});
        }
    });
});

// =========================
// COMMENT ROUTS
// =========================
// CREATE
app.post('/places/:id', isLoggedIn, function(req, res){
    Place.findById(req.params.id, function (err, foundPlace) {
        if (err){
            console.log(err);
            req.redirect('/places');
        } else {
            console.log(req.body.comment)
            Comment.create(req.body.comment, function (err, newComment) {
                if (err) {
                    console.log(err);
                } else {
                    foundPlace.comments.push(newComment);
                    foundPlace.save();
                    res.redirect('/places/' + foundPlace._id);
                }
            })
        }
    })
    // get data from form
    // create new comment
    
});

// NEW
// app.get('/places/:id/comments/new', function(req, res){
//     Place.findById(req.params.id, function(err, foundPlace){
//         if (err) {
//             console.log(err);
//         } else {
//             res.render('comments/new', {place: foundPlace});
//         }
//     })
// });

// register 
// app.get('/register', function (req, res) {
//     res.render('login');
// })

app.post('/register', function (req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect('login');
        } else {
            passport.authenticate('local')(req, res, function () {
                res.redirect('/places')
            })
        }
    });
});

// show login from
app.get('/login', function (req, res) {
    res.render('login');
})

app.post('/login', passport.authenticate('local', 
    {
        successRedirect: '/places',
        failureRedirect: '/login'
    }), function (req, res) {
    
})

// logout
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/places');
})

app.listen(2000, function(){
    console.log("server is running...");
})
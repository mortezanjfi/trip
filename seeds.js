var mongoose = require('mongoose'),
    Place = require('./models/place'),
    Comment = require('./models/comment');

var Data =[
    {
        name: 'Tehran', 
        image: 'https://ifpnews.com/wp-content/uploads/2018/10/tehran-1200x798.jpg'   
    },
    {
        name: 'Isfahan', 
        image: 'https://www.letsvisitpersia.com/wp-content/uploads/2019/12/must-see-in-isfahan.jpg'
    },
    {
        name: 'Shiraz', 
        image: 'https://s25910.pcdn.co/wp-content/uploads/2018/02/Pink-Mosque-Things-To-Do-In-Shiraz.jpg'
    }
];

function seedDB(){
    Place.deleteMany({}, function(err){
        if (err){
            console.log(err);
        }
        console.log('remove all places');
        // add a few place
        Data.forEach(function(seed){
            Place.create(seed, function(err, place){
                if(err) {
                    console.log(err);
                } else {
                    console.log('added place');
                    // add a few comment
                    Comment.create(
                        {
                            text: 'this is beautiful',
                            author: 'john'
                        }, function(err, comment){
                        if (err){
                            console.log(err)
                        } else {
                            place.comments.push(comment)
                            place.save();
                            console.log('new comment created');
                        }
                    })
                }
            });
        })
    });
}

module.exports = seedDB;
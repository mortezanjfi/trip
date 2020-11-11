var mongoose = require('mongoose');

//SCHEMA setup
var placeSchema = new mongoose.Schema({
    name: String,
    image: String,
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
     ]
});

//compile schema to model
module.exports = mongoose.model( 'Place', placeSchema);
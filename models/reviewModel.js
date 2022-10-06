const mongoose = require('mongoose');
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        trim : true,
        required : [true, 'Review can not be empty.'],
    },
    rating: {
        type : Number,
        default : 4.5,
        min:[1, 'Rating must be above 1'],
        max:[5, 'Rating must be under 5']
    },
    createdAt: {
        type : Date,
        default : Date.now(),
        select: false,
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref:'Tour',
        required : [true, 'Review must belong to a tour.'],
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required : [true, 'Review must belong to a user.'],
    },
    
},
{
    toJSON: {virtuals:true},
    toObject: {virtuals:true},
});

// One user only can share one review on one tour.
reviewSchema.index( {tour:1, user:1}, {unique:true}, )

reviewSchema.pre(/^find/, function(next) {
/*     this.populate({
      path :'tour',
      select : 'name',
    })
    .populate({
        path :'user',
        select : 'name photo'
    }); */

    this.populate({
          path :'user',
          select : 'name photo'
      })

    next();
  })

//! Ortalama rating hesaplama icin, save ile birlikte;
reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match : { tour : tourId}
        },
        {
            $group : {
                _id: ' $tour',
                nRating : { $sum : 1},
                avgRating : { $avg: '$rating'}
            }
        }
    ]);
    // console.log(stats);
    if (stats.length > 0) {

        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        })
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }
}

reviewSchema.post('save', function() {
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne();
    // console.log(this.r);
    next();
});

reviewSchema.post(/^findOneAnd/, async function(){
    // await this.findOne(); does not work here because query has alredy executed before
    await this.r.constructor.calcAverageRatings(this.r.tour); 
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
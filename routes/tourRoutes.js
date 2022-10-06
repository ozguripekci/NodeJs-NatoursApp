const express = require('express');
const tourController = require('./../controllers/tourController');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController')
const reviewRouter = require('./../routes/reviewRoutes');



const router = express.Router({});
/* router.param('id', tourController.checkId); */

router.use('/:tourId/reviews', reviewRouter);

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours)

router
    .route('/tour-stats')
    .get(tourController.getTourStats)

router
    .route('/montly-plan/:year')
    .get(tourController.getMonthlyPlan, authController.restrictTo('admin', 'lead-guide'), authController.protect)

//! harita da yerimizi bildirmek ve mesafeyi ayarlamak icin. Bunu kendi app icinde de yapabiliriz.
router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.createTour)

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.updateTour)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour)




module.exports = router;
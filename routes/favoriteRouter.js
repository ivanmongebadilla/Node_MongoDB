const express = require('express');
const Favorite = require('../models/favorite');

const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json')
        res.json(favorites);
    })
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if (favorite) {
            console.log('Entering if')
            console.log('favorite.campsites: ', favorite.campsites )
            req.body.forEach((element) => {
                console.log('Element: ', element._id)
                if (!favorite.campsites.includes(element._id)) {
                    favorite.campsites.push(element._id);
                }
            })
            favorite.save()
            .then (favorite => {
                res.statusCode =200;
                res.setHeader('Content-Type', 'application/json')
                res.json(favorite);
            })
            .catch(err => next(err));
        } else {
            console.log('Entering else of favorite')
            Favorite.create({ user: req.user._id, campsites: req.body})
            .then (favorite => {
                favorite.save()
                .then(() => res.statusCode = 200)
                .catch(err => next(err))
                res.statusCode =200;
                res.setHeader('Content-Type', 'application/json')
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('Operation not supported')
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
    .then ( favorite => {
        if (favorite) {
            res.statusCode =200;
            res.setHeader('Content-Type', 'application/json')
            res.json(favorite);
        } else {
            res.setHeader('Content-Type', 'application/json')
            res.end('You do not have any favorites to delete.')
        }
    })
})

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('Operation not supported')
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then( favorite => {
        if (!favorite.campsites.includes(req.params.campsiteId)) {
            favorite.campsites.push(req.params.campsiteId);
            favorite.save()
            .then (favorite => {
                res.statusCode =200;
                res.setHeader('Content-Type', 'application/json')
                res.json(favorite);
            })
        } else {
            res.setHeader('Content-Type', 'application/json')
            res.end('That campsite is already in the list of favorites!')
        }
    })
    .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('Operation not supported')
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if (favorite) {
            if (favorite.campsites.includes(req.params.campsiteId)) {
                favorite.campsites = favorite.campsites.filter(item => {
                    return item != req.params.campsiteId
                })
                favorite.save()
                .then (favorite => {
                    res.statusCode =200;
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite);
                })
            .catch(err => next(err))
            } else {
                res.setHeader('Content-Type', 'application/json')
                res.end('You dont have that favorite campsite')
            }
        } else {
            res.setHeader('Content-Type', 'application/json')
            res.end('There are not favorites to delete')
        }
    })
    .catch(err => next(err))
})

module.exports = favoriteRouter;
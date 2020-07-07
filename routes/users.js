let express = require('express')
const { body, validationResult } = require('express-validator')

let router = express.Router();

router.route('/login')
    .get((req, res) => {
        if (req.session.user) {
            return res.redirect('/')
        } else {
            return res.render('login')
        }
    })
    .post([
        // check email
        body('email')
            .exists()
            .withMessage("email not exists")
            .bail()
            .isEmail()
            .withMessage("invalid email"),
        // check password
        body('password')
            .exists()
            .withMessage("password not exists")
            .isLength({min: 8})
            .withMessage("password must be at least 8 characters")
    ], async (req, res) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(200).render('login', {errors: errors.array()})
        }

        const dbclient = req.app.locals.dbclient
        const usersCollection = dbclient.db('loginapp').collection('users')
        let result
        try {
            result = await usersCollection.findOne({email: req.body.email, password: req.body.password})
        } catch (err) {
            return res.render('login', {alert: "something was wrong"})
        }
        if (result) {
            // user logged
            // set user in session
            req.session.user = {
                username: result.username,
                email: result.email
            }
            return res.redirect('/')
        }

        return res.render('login', {errors: []})
    })

router.route('/register')
    .get((req, res) => {
        if (req.session.user) {
            return res.redirect('/')
        } else {
            return res.render('register')
        }
    })
    .post([
        // check email
        body('email')
            .exists().withMessage("email not exists")
            .bail()
            .isEmail().withMessage("invalid email"),
        // check password and confirm password
        body(['password', 'confirm-password'])
            .exists().withMessage("password not exists")
            .isLength({min: 8}).withMessage("password must be at least 8 characters"),
        // check user name
        body('username')
            .exists().withMessage("user not exists")
            .isLength({min: 8}).withMessage("username must be at least 8 characters"),
    ], async (req, res) => {
        // get errors
        const errors = validationResult(req)

        // check if there is errors occurs in the body params validation
        if (!errors.isEmpty()) {
            return res.json({errors: errors.array()})
            return res.status(200).render('register', {errors: errors.array()})
        }

        // check if password are the same
        if (req.body.password !== req.body["confirm-password"]) {
            return res.json({errors: [{param: 'confirm-password', msg: 'password confirmation not equal'}]})
            return res.status(200).render('register', {errors: [{param: 'confirm-password', msg: 'password confirmation not equal'}]})
        }

        // get mongodb client
        const dbclient = req.app.locals.dbclient
        // get users collection
        const usersCollection = dbclient.db('loginapp').collection('users')

        // find user by email
        const findUserByUserName = await usersCollection.findOne({username: req.body.username})
        // if email already exists notice the error
        if (findUserByUserName) {
            return res.json({errors: [{param: 'username', msg: "user already exists"}]})
            return res.status(200).render('register', {errors: [{param: 'username', msg: "user already exists"}]})
        }

        // find user by username
        const findUserByEmail = await usersCollection.findOne({email: req.body.email})
        // if username already exists notice the error
        if (findUserByEmail) {
            return res.json({errors: [{param: 'email', msg: "email already exists"}]})
            return res.status(200).render('register', {errors: [{param: 'email', msg: "email already exists"}]})
        }
        let result
        try {
            // add the user
            result = await usersCollection.insertOne({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            })
        } catch (e) {
            return res.json({alert: "something was wrong"})
            return res.render('register', {alert: "something was wrong"})
        }

        // check user if is inserted
        if (result.insertedCount === 1) {
            // set user in session
            req.session.user = {
                username: req.body.username,
                email: req.body.email
            }
            // redirect user to homepage
            return req.redirect('/')
        }
        return res.json({alert: "something was wrong"})
        return res.render('register', {alert: "something was wrong"})
    })

module.exports = router;

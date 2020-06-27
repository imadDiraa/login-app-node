let express = require('express')

let router = express.Router();

router.route('/login')
    .get((req, res) => {
      res.render('login')
    })
    .post((req, res) => {
      let body = req.body
      console.log(body)
      res.end(JSON.stringify(body))
    })

router.route('/register')
    .get((req, res) => {
      res.render('register')
    })
    .post((req, res) => {
      let body = req.body
      console.log(body)
      res.end('registered successfully')
    })

module.exports = router;

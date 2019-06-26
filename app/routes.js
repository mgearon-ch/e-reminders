const express = require('express')
const postmark = require('postmark')
const router = express.Router()
const { check, validationResult } = require('express-validator')

/*
Had to invert the checker for the empty field  using the .not.
This was answered here:ttps://stackoverflow.com/questions/50767728/no-errors-with-express-validator-isempty
*/

router.post('/company-search', [check('companynumber', 'Enter a valid company number').not().isEmpty()], (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.render('company-search', { errors: errors.array() })
  } else {
    req.session.number = req.body.companynumber
    res.redirect('/results')
  }
})
/*
Checking the email is valid using .isEmail
*/
router.post('/email-adress', [check('email', 'Enter a valid email address').isEmail()], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.render('email-adress', { errors: errors.array() })
  } else {
    req.session.email = req.body.email
    res.redirect('/finished')
  }
})

router.get('/results', (req, res) => {
  console.log(req.session.number)
  res.render('results')
})

router.get('/finished', function (req, res) {
  var scenario = 'test'
  var extensionReasons = 'test'
  var userEmail = 'test'

  if (process.env.POSTMARK_API_KEY) {
    var client = new postmark.Client(process.env.POSTMARK_API_KEY)
    client.sendEmailWithTemplate({
      'From': process.env.FROM_EMAIL,
      'To': req.session.email,
      'TemplateId': process.env.ETID_CONFIRMATION,
      'TemplateModel': {
        'scenario': scenario,
        'extensionReasons': extensionReasons,
        'userEmail': userEmail
      }
    }, function (error, success) {
      if (error) {
        console.error('Unable to send via postmark: ' + error.message)
      }
    })
  } else {
    console.log('No Postmrk API key detected. To test emails run app locally with `heroku local web`')
  }
  var email = req.session.email
  var companynumber = req.session.number
  console.log(req.session.email)
  res.render('finished', { email: email, companynumber: companynumber })
})

module.exports = router

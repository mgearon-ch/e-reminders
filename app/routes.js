const express = require('express')
const postmark = require('postmark')
const router = express.Router()
const { check, validationResult } = require('express-validator')

/*
Had to invert the checker for the empty field  using the .not.
This was answered here:ttps://stackoverflow.com/questions/50767728/no-errors-with-express-validator-isempty
*/
router.post('/company-search', [check('companynumber', 'Enter a valid company number').not().isEmpty()], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.render('company-search', { errors: errors.array() })
  } else {
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
    res.redirect('/finished')
  }
})

router.get('/finished', function (req, res) {
  var scenario = 'test'
  var extensionReasons = 'test'
  var userEmail = 'test'

  if (process.env.POSTMARK_API_KEY) {
    var client = new postmark.Client(process.env.POSTMARK_API_KEY)
    client.sendEmailWithTemplate({
      'From': process.env.FROM_EMAIL,
      'To': process.env.TO_EMAIL,
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
  res.render('finished')
})

module.exports = router

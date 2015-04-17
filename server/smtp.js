// Meteor.startup(function () {
//   smtp = {
//     username: 'rcolepeterson25@gmail.com',   // eg: server@gentlenode.com
//     password: 'Zaaz1234',   // eg: 3eeP1gtizk5eziohfervU
//     server:   'smtp.gmail.com',  // eg: mail.gandi.net
//     port: 465
//   }
// console.log('we have set the smtp');
//   process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
// });


// Meteor.startup(function() {

// 	console.log("we are setting up accounts");
//   // By default, the email is sent from no-reply@meteor.com. If you wish to receive email from users asking for help with their account, be sure to set this to an email address that you can receive email at.
//   Accounts.emailTemplates.from = 'Cole Peterson <rcolepeterson25@gmail.com>';

//   // The public name of your application. Defaults to the DNS name of the application (eg: awesome.meteor.com).
//   Accounts.emailTemplates.siteName = 'Cole Peterson';

//   // A Function that takes a user object and returns a String for the subject line of the email.
//   Accounts.emailTemplates.verifyEmail.subject = function(user) {
//     console.log('verify email');
//     return 'Confirm Your Email Address';
//   };

//   // A Function that takes a user object and a url, and returns the body text for the email.
//   // Note: if you need to return HTML instead, use Accounts.emailTemplates.verifyEmail.html
//   Accounts.emailTemplates.verifyEmail.text = function(user, url) {
//     return 'click on the following link to verify your email address: ' + url;
//   };
// });
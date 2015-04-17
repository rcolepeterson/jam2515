/*****************************************************************************/
/* Client and Server Routes */
/*****************************************************************************/
Router.configure({
    layoutTemplate: 'MasterLayout',
    loadingTemplate: 'Loading',
    notFoundTemplate: 'NotFound'
});

// Router.route('/', {
//     name: 'Home',
//     action: function() {
//         Router.go('mixtape');
//     }
// });

Router.route('/', {
    name: 'mixtape',
    template: 'mixtape',
    waitOn: function() {
        return [Meteor.subscribe('rooms'), Meteor.subscribe('videos'), Meteor.subscribe("messages"), Meteor.subscribe("userStatus")]
    },
    data: function() {
        var room = Rooms.findOne({}, {
            sort: {
                created_at: -1
            }
        });
        return room;
    },
    action: function() {

        if (this.ready()){
            //console.log('we are ready');
            this.render('mixtape')
        }else{
            //console.log('we are loading');
            this.render('Loading');
        }
    }
});

// Router.route('/verify-email/:_token', {
//     controller : 'AccountController',
//     action : 'verifyEmail'
// });

// AccountController = RouteController.extend({
//     onBeforeAction: function () {
//        console.log('cock');
//         this.render('Loading');
//         this.next();
//     },

//     verifyEmail: function() {
//         debugger;
//         var verificationToken = this.params._token;
//         console.log(verificationToken);
//         Accounts.verifyEmail(verificationToken,  function(error) {
//            if (error) {
//                console.log(error);
//            } else {
//                Router.go('/');
//            }
//         });

//     }
// });



//http://meteortips.com/tutorial/twitter-login-provider/
Accounts.onCreateUser(function(options, user) {
    if (options.profile) {

        if (user.services.facebook) {
            user.username = user.services.facebook.name;
            options.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=square";
        }

        if (user.services.twitter) {
            user.username = user.services.twitter.screenName;
            options.profile.picture = user.services.twitter.profile_image_url;
        }

        if (user.services.google) {
            user.username = user.services.google.name;
            options.profile.picture = user.services.google.picture;
        }

        // if (!options.profile.picture) {
        //     var email = user.emails[0].address;
        //     user.username = email.substring(0, email.indexOf("@"));
        //     options.profile.picture = "//fillmurray.com/50/50";
        // }

        user.profile = options.profile;
    }

    //Meteor.call('setUserPic', options.profile.picture, function(error, result) {});

    return user;
});



Accounts.onLogin(function(options, user) {

       
       //Meteor.users.update({_id: CurrentUserId}, {$set: {downVoteCount: 3}});
       //
       

        //var hasPic = Meteor.users.find({_id: CurrentUserId}).profile.picture;
        // var rm = Rooms.findOne({});
        // var usersCount = Meteor.users.find({_id:rm._id, "status.online": true}).count();
        // console.log("Accounts.onLogin: usersCount ",usersCount);
    // //
    // var picture = "//fillmurray.com/50/50";

    // Meteor.call('setUserPic', picture, function(error, result) {
    //         console.log('set user pic ' + result)
    //     });

});

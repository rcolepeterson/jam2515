//http://meteortips.com/tutorial/twitter-login-provider/
Accounts.onCreateUser(function(options, user) {
    if (options.profile) {

        if (user.services.facebook) {
            user.username = user.services.facebook.name;
            options.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=square";
        }

        if (user.services.twitter) {
            options.profile.picture = user.services.twitter.profile_image_url;
        }

        user.profile = options.profile;
    }

    Meteor.call('setUserPic', options.profile.picture, function(error, result) {
        console.log('set user pic ' + result)
    });

    return user;
});

Accounts.onLogin(function() {
    //console.log('onLogin');
});

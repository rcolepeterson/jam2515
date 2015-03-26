/*****************************************************************************/
/* Home: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Home.events({
    'click #removeall': function(e, tmpl) {
        Meteor.call('removeAllVideos');
        e.preventDefault();
    },
    'click #removeallMsgs': function(e, tmpl) {
        Meteor.call('removeAllMessages');
        e.preventDefault();
    },
    'click #removeUserBtn': function(e, tmpl) {
        var id = Meteor.user()._id;
        Meteor.call('removeUser', id, function(err, response) {
            console.log("we did it. removed" + response);
        });
        e.preventDefault();
    },
    'click #removeallRooms': function(e, tmpl) {
        Meteor.call('removeallRooms');
        e.preventDefault();
    },
    'click .stert': function(e, tmpl) {
        if (Rooms.find().fetch().length === 0) {

            if (!Meteor.user()) {
                sAlert.error('Hold On! You must be logged in to start this party!!', {
                    effect: 'genie',
                    position: 'right-bottom',
                    timeout: 5000
                });
                return;
            }

            var videoId = 'CvgqWO_TgP0';
            if ( Videos.findOne({})){
                var playlistVideoItem = Videos.findOne({}).videoId;
                if ( playlistVideoItem ){
                    videoId = playlistVideoItem;
                }
            }

            Rooms.insert({
                created_at: new Date(),
                playerCurrentTime: 0,
                ownerId: Meteor.user()._id,
                roomname: 'That is my jam',
                videoId: videoId,
                ownerHasNavigatedAway:false,
                like: 3
            });

        } else {
            Router.go('mixtape');
        }
        e.preventDefault();
    }
});

Template.Home.helpers({
    roomStatus: function() {
        var room = Rooms.findOne({});
        var str = "No party. Click here to start one.";
        if (room) {
            str = "Join the party."
        }
        return str;
    },
});


Template.Home.user_image = function() {
    return $.trim(Meteor.user().profile.picture);

    // try {
    //     if (Meteor.user().services.facebook) {
    //         return "http://graph.facebook.com/" + Meteor.user().services.facebook.id + "/picture/?type=large";

    //     } else if (Meteor.user().services.twitter) {
    //         return Meteor.user().services.twitter.profile_image_url;
    //     } else if (Meteor.user().profile) {
    //         return $.trim(Meteor.user().profile.avatar);
    //     } else {
    //         return "http://rcolepeterson.com/images/francis_peterson.jpg";
    //     }
    // } catch (err) {
    //     console.log(err);
    // }
};



/*****************************************************************************/
/* Home: Lifecycle Hooks */
/*****************************************************************************/
Template.Home.created = function() {};

Template.Home.rendered = function() {
    //center assets. takes care of vendor prefixes.
    TweenMax.set(".centerMe", {
        xPercent: -50,
        yPercent: -50
    });

    //sAlert.error('Boom! Something went wrong!', {effect: 'genie', position: 'right-bottom', timeout: 'no'});
};

Template.Home.destroyed = function() {};

/*****************************************************************************/
/* mixtape: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.mixtape.events({
    'click .btn-like': function(e, tmpl) {
        if (!Meteor.user()) {
           App.helpers.displayAlert('Hey! You must be logged in to like a video!');
            return;
        }
        //max like is 6.
        if (this.like > 5) {
            return false
        }

        Rooms.update({_id: this._id}, {
            $inc: {like: 1}
        });
        //$('#content-container .btn-like').attr('disabled', true);

        App.helpers.setRoomAlert(App.helpers.getUserName() + ' just liked this video.');
    },

    'click .btn-hate': function(e, tmpl) {

        if (!Meteor.user()) {
           App.helpers.displayAlert('Hey! You must be logged in to hate on a video!');
            return;
        }
        Rooms.update({_id: this._id}, {
            $inc: {like: -1}
        });
        //$('#content-container .btn-hate').attr('disabled', true);
        username = App.helpers.getUserName();
        App.helpers.setRoomAlert(username + ' just dissed this video.');
    }
});


Template.mixtape.helpers({
    video: function() {
        return Videos.findOne({
            videoId: this.videoId
        });
    },
    usersOnline: function() {
        return Meteor.users.find({
            "status.online": true
        })
    }
});

/*****************************************************************************/
/* mixtape: Lifecycle Hooks */
/*****************************************************************************/
Template.mixtape.onCreated(function() {
    var self = this;
    // When this template is used, get the data we need.
    self.autorun(function() {
        var rm = Rooms.findOne({});
        if (!rm){
            App.helpers.createRoom();
        }else if (!rm.ownerId && Meteor.user()){
            Rooms.update({_id: rm._id}, {$set: {ownerId: Meteor.user()._id}});
        }

        self.subscribe("rooms", function(){
            //reactivly track who the room owner is.
            Tracker.autorun(function () {
                if (!Meteor.user() )
                {
                    Session.set("isRoomOwner", false);
                    return;
                }
                Session.set("isRoomOwner", Rooms.findOne({}).ownerId === Meteor.user()._id );
            });
        });
    });
});

Template.mixtape.rendered = function() {

    var handleRoom = Rooms.find({}).observeChanges({
        
        changed: function(id, fields) {
            
            if (fields.videoId) {
                //video has chnaged. load the next one.
                player.loadVideoById(fields.videoId, 1);
            }

            if (fields.like) {
                //user has modifed like. load new video if ...
                if (Number(fields.like) < 1) {
                    removeVideoAndLoad();
                }
            }

            if (fields.ownerId) {
                //We are changing the owner id.
                if (!Meteor.user() || !Session.get("isRoomOwner")) {
                    //if not logged in or user is not the room owner .... get the current playhead time and apply.
                    var seconds = Rooms.findOne({}).playerCurrentTime;
                    player.seekTo(seconds)
                    return;
                }
            }

            if (fields.alert){
                App.helpers.displayAlert(fields.alert);
                //reset.
                var roomId = Rooms.findOne({})._id;
                Rooms.update({_id: roomId}, {$set: {alert: ''}});
            }
        }
    });
    
    //define the 1st video to play.
    var videoId = "";
    var room = Rooms.findOne({});
    if (room) {
       videoId = room.videoId;
    }

    if ( !Videos.findOne({}))
    {
         App.helpers.displayAlertInfo('Oh no! There are no more videos in the playlist. Can you SEARCH and add one?');
    }

    onYouTubeIframeAPIReady = function() {
        player = new YT.Player("player", {
            playerVars: {
                'modestbranding': 1,
                'controls': 0,
                'autohide': 0,
                'autoplay': 1,
                'showinfo': 0
            },
            videoId: videoId,
            events: {
                onReady: function(event) {
                    
                    if (!Meteor.user() || !Session.get("isRoomOwner")) {
                        //if NOT logged in.... or not the room owner update playhead.
                        adjustPlayhead();
                        return
                    }

                },
                'onStateChange': function(evt) {
                    if (evt.data == YT.PlayerState.ENDED) {
                       removeVideoAndLoad();
                    }
                },
                'onError': function(evt) {
                   App.helpers.setRoomAlert('Oh no! The video be broken!');
                }
            }
        });
    };
    YT.load();
};

/**
 * seeks to value defined on Room object.
 * @return {[type]} [description]
 */
function adjustPlayhead()
{
    if (!player)
    {
        return;
    }

    player.seekTo(Rooms.findOne({}).playerCurrentTime)
}

/**
 * Removes the currently playing video and selects the next one updating the Room object video id.
 * @return {[type]} [description]
 */
function removeVideoAndLoad() {

    
    if ( Meteor.users.find({"status.online": true}).count() < 1) {
        App.helpers.displayAlertInfo('No users are logged in so we have to stop until someone signs in');
        return;
    }
    var myid = Rooms.findOne({}).videoId;
    var videoID = Videos.findOne({});

    //only run if this user is the room owner.
    if (!Session.get("isRoomOwner")){
        

        if ( !myid || !videoID){
            App.helpers.displayAlertInfo('Oh no! There are no more videos in the playlist. Can you SEARCH and add one?');
        }

        adjustPlayhead();
        return;
    }

    if ( !myid || !videoID){
        player.stopVideo();
        App.helpers.displayAlertInfo('Oh no! There are no more videos in the playlist. Can you SEARCH and add one?');
        return;
    }

    //Make server side call to remove the current vidoo. on call back load the next one.
    Meteor.call('removeOneVideo', myid, function(error, result) {
        var roomId = Rooms.findOne({})._id;
        Rooms.update({_id: roomId}, {$set: {like: 3, playerCurrentTime:0}});

        var video = Videos.findOne({});
        if (!video){
            App.helpers.displayAlertInfo('Oh no! There are no more videos in the playlist. Can you SEARCH and add one?');
            return;
        }
        var videoId = video.videoId;
        //$('#content-container .btn-rate').attr('disabled', false);
        Rooms.update({_id: roomId}, {$set: {videoId: videoId}}, function (error) {
            if ( error )
            console.warn('removeOneVideo > Rooms.update error');
        });
    });
}


///////////////////////////////////////////////////

setInterval(function() {

    if ( !player){
        return
    }

    //room owner updates Room with current playhead time.
    if (Session.get("isRoomOwner")) {
        Meteor.call('updatePlayerCurrentTime', Meteor.user()._id, player.getCurrentTime(), function(err, response) {
           // console.log("we did it. player.getCurrentTime()" + Meteor.user()._id);
        });
    }
}, 2000);


////////////////////////////
///user
////////////////////////////
if (Meteor.isClient) {
    Meteor.users.find({
        "status.online": true
    }).observe({
        _suppress_initial: true,
        added: function(user) {
            // just came online
            var username = "no name";
            if (user.username){
                username = user.username;
            }
             //hack for twitter. @todo - figure out.
            if (user.profile.name){
                username = user.profile.name;
            }

           App.helpers.setRoomAlert(username + ' just joined the party!', true);
        },
        removed: function(user) {

            // just came online
            var username = "no name";
            if (user.username)
                username = user.username;

            if (user.profile.name)
                username = user.profile.name;

           App.helpers.setRoomAlert(username + ' just left the party!', true)

            var r = Rooms.findOne({});
            if (r.ownerId === user._id) {
                console.log('the owner has left the room: ' + user._id);
                //update room owner
                App.helpers.changeRoomOwner();
            }
        }
    });
}

//******************************************************
//info about the users and the video

Template.videoInfo.onCreated(function() {
    var self = this;
    // When this template is used, get
    // the data we need.
    self.autorun(function() {

        Meteor.subscribe("userStatus", function() {
            //Callback fired when data received
            var oneUser = Meteor.users.find({"status.online": true}).count();
            var rm = Rooms.findOne({});
            //if the Room ownerID is not online update.
            if ( Meteor.users.find({_id:rm.ownerId, "status.online": true}).count() < 1){
                App.helpers.changeRoomOwner();
            }
        });

    });
});

Template.videoInfo.helpers({

    isYourRoom: function() {
        var room = Rooms.findOne({});
        if (!Meteor.user() || !room) {
            return;
        }
        return room.ownerId === Meteor.user()._id;
    },

    video: function() {
        return Videos.find({});
    },


    percentageLiked: function() {
        var perc = Math.round((this.like / 6) * 100), $pBar = $('.progress-bar');
        $pBar.removeClass('progress-bar-danger');
        if (perc > 100) {
            perc = 100;
        } else if (perc <= 25) {
            $pBar.addClass('progress-bar-danger');
        }

        if (perc < 5) {
            perc = 5;
        }

        return perc
    }
});

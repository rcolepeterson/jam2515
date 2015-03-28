/*****************************************************************************/
/* mixtape: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.mixtape.events({
    'click .btn-like': function(e, tmpl) {
        if (!Meteor.user()) {
            displayAlert('Hey! You must be logged in to like a video!');
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
        displayAlert(Meteor.user().username + ' just liked this video.');
    },

    'click .btn-hate': function(e, tmpl) {

        if (!Meteor.user()) {
            displayAlert('Hey! You must be logged in to hate on a video!');
            return;
        }
        Rooms.update({_id: this._id}, {
            $inc: {like: -1}
        });
        //$('#content-container .btn-hate').attr('disabled', true);
        displayAlert(Meteor.user().username + ' just dissed this video.');
    }
});


Template.mixtape.helpers({
    room: function() {
        return Rooms.findOne({}, {
            sort: {created_at: -1}
        });
    },
    videoId: function() {
        return this.videoId;
    },
    video: function() {
        return Videos.findOne({
            videoId: this.videoId
        });
    },
    likes: function() {
        return this.like;
    },
    usersOnline: function() {
        return Meteor.users.find({
            "status.online": true
        })
    }
});

//******************************************************

Template.videoInfo.onCreated(function() {
    var self = this;
    // When this template is used, get
    // the data we need.
    self.autorun(function() {

        //
        Meteor.subscribe("userStatus", function() {
            //Callback fired when data received
            var oneUser = Meteor.users.find({"status.online": true}).count();
            var rm = Rooms.findOne({});
            console.log('room ' + rm.ownerId);
            console.log(Meteor.users.find({_id:rm.ownerId, "status.online": true}).count());
            //if the Room ownerID is not online update.
            if ( Meteor.users.find({_id:rm.ownerId, "status.online": true}).count() < 1){
                chnageRoomOwner();
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

/*****************************************************************************/
/* mixtape: Lifecycle Hooks */
/*****************************************************************************/
Template.mixtape.onCreated(function() {
    var self = this;
    // When this template is used, get the data we need.
    self.autorun(function() {
        var rm = Rooms.findOne({});
        if (!rm){
            createRoom();
        }else if (!rm.ownerId && Meteor.user()){
            Rooms.update({_id: rm._id}, {$set: {ownerId: Meteor.user()._id}});
        }

        self.subscribe("rooms", function(){
            //reactivly track who the room owner is.
            Tracker.autorun(function () {
                Session.set("isRoomOwner", Rooms.findOne({}).ownerId === Meteor.user()._id );
            });
        });
    });
});

Template.mixtape.rendered = function() {

    var handleRoom = Rooms.find({}).observeChanges({
        
        changed: function(id, fields) {
            if (fields.videoId) {
                console.log('I have observerd the video id has changed', fields.videoId);
                player.loadVideoById(fields.videoId, 1);
            }

            if (fields.like) {
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
        }
    });

    var videoId = "";
    var room = Rooms.findOne({});
    if (room) {
       videoId = room.videoId
    }

    onYouTubeIframeAPIReady = function() {
        player = new YT.Player("player", {
            playerVars: {
                'modestbranding': 1,
                'controls': 1,
                'autohide': 0,
                'autoplay': 1,
                'showinfo': 0
            },
            videoId: videoId,
            events: {
                onReady: function(event) {
                    
                    if (!Meteor.user() || !Session.get("isRoomOwner")) {
                        //if NOT logged in.... or not the room owner update playhead.
                        player.seekTo(Rooms.findOne({}).playerCurrentTime)
                        return
                    }

                },
                'onStateChange': function(evt) {
                    if (evt.data == YT.PlayerState.ENDED) {
                       removeVideoAndLoad();
                    }
                },
                'onError': function(evt) {
                    displayAlert('Oh no! That video be broken!');
                }
            }
        });
    };
    YT.load();
};

///////////////////////////////////////////////////



/**
 * Removes the currently playing video and selects the next one updating the Room object video id.
 * @return {[type]} [description]
 */
function removeVideoAndLoad() {

    if ( Meteor.users.find({"status.online": true}).count() < 1) {
        displayAlert('No users are logged in so we have to stop until someone signs in');
        return;
    }

    //only run if this user is the room owner.
    if (!Session.get("isRoomOwner")){
        return;
    }

    var myid = Rooms.findOne().videoId
    if ( !myid ){
        return;
    }

    //Make server side call to remove the current vidoo. on call back load the next one.
    Meteor.call('removeOneVideo', myid, function(error, result) {
        var roomId = Rooms.findOne({})._id;
        Rooms.update({_id: roomId}, {$set: {like: 3, playerCurrentTime:0}});

        var video = Videos.findOne({});
        if (!video){
            displayAlert('Oh no! There are no more videos in the playlist. Can you SEARCH and add one?');
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


function createRoom() {

    Rooms.insert({
        created_at: new Date(),
        playerCurrentTime: 0,
        ownerId: Meteor.user()._id,
        roomname: 'That is my jam',
        videoId: 'CvgqWO_TgP0',
        ownerHasNavigatedAway: false,
        like: 3
    });
}

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

///////////////////////////
function displayAlert(str,val)
{
     if (val == false ){
            sAlert.closeAll();
    }
     sAlert.error(str, {
        effect: 'genie',
        position: 'right-bottom',
        timeout: 3000
    });
}

////////////////////////////user
if (Meteor.isClient) {
    Meteor.users.find({
        "status.online": true
    }).observe({
        _suppress_initial: true,
        added: function(user) {
            // just came online
            var username = "no name";
            if (user.username)
                username = user.username;

            if (user.profile.name)
                username = user.profile.name;

            displayAlert(username + ' just joined the party!', true)
        },
        removed: function(user) {

            // just came online
            var username = "no name";
            if (user.username)
                username = user.username;

            if (user.profile.name)
                username = user.profile.name;

            displayAlert(username + ' just left the party!', true)


            var r = Rooms.findOne({});
            if (r.ownerId === user._id) {
                console.log('the owner has left the room: ' + user._id);
                //update room owner
                chnageRoomOwner();
            }
        }
    });

    /**
     * Changes the owner of the room.
     * @param  {[type]} roomId [description]
     * @return {[type]}        [description]
     */
    function chnageRoomOwner() {
        var newOwner = Meteor.users.findOne({"status.online": true}, {sort: {createdAt: -1}});
        var roomId = Rooms.findOne({})._id;
        var newOwnerId = "";
        
        if (newOwner) {
            newOwnerId = newOwner._id;
        }
        var update = Rooms.update({_id: roomId}, {$set: {ownerId: newOwnerId}});
    }

}

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
        var perc = Math.round((this.like / 6) * 100),
            $pBar = $('.progress-bar');
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
 var videosLoaded = false;
 Meteor.subscribe('videos', function(){
            console.log('we have subsribed 2 videos');
            videosLoaded = true;
        });

Template.mixtape.onCreated(function() {
    var self = this;
    // When this template is used, get the data we need.
    self.autorun(function() {
        var rm = Rooms.findOne({});
        if (!rm){
            //createRoom();
        }else if (!rm.ownerId && Meteor.user()){
            Rooms.update({_id: rm._id}, {$set: {ownerId: Meteor.user()._id}});
        }



        self.subscribe("rooms", function(){
            //reactivly track who the room owner is.
            Tracker.autorun(function () {
                Session.set("isRoomOwner", Rooms.findOne({}).ownerId === Meteor.user()._id );
                //hack to fix observe chand firing twice when using update
            });
        });
    });
});

Template.mixtape.rendered = function() {


    Session.set("oldRoomVideoID", Rooms.findOne().videoId );
    console.log('video applies is',Session.get("oldRoomVideoID"));


    var handle = Videos.find({}).observeChanges({
        added: function(id, fields) {
            
            //console.log('videos observe: add: ',Videos.find({}).count());
            //player.getPlayerState()
            //if there is only one video now. lets play it.
          ///  if ( Videos.find({}).count() === 1){
              //     console.log('we better set this on the room: ' + fields.videoId);
                   //var roomId = Rooms.findOne({})._id;
                //   console.log('currentroomid: ' + Rooms.findOne({}).videoId);
                   // Rooms.update({_id:roomId}, {$set: {videoId:fields.videoId}}, function(err){
                   //      console.log(Rooms.findOne({}).videoId,' room call back. err? ',err);
                   //      //handle.stop();
                   // });





                   // Meteor.call('updateRoomVideoID', fields.videoId, function(error, result) {
                   //  console.log('we have updated',error,result);
                   //  console.log('currentroomid: ' + Rooms.findOne({}).videoId);
                   // });
           // }
        },
        removed: function(id) {
        }
    });

    var handleRoom = Rooms.find({}).observeChanges({
        added: function(id, fields) {
            // ...
        },
        // Use either added() OR(!) addedBefore()
        // addedBefore: function (id, fields, before) {
        //     // ...
        // },
        changed: function(id, fields) {
            console.log('i have observed the Rooms prop has changed');
            if (fields.videoId) {
                
                console.log('old video is',Session.get("oldRoomVideoID") ,"new video is " + fields.videoId);
                //if user is not 'room owner' stop.
                if ( !Session.get("isRoomOwner")){
                        return;
                }
                //hack. if we are trying to load the old video stop. not sure why this CB gets called twice on update.
                if (  Session.get("oldRoomVideoID") === fields.videoId )
                {
                    console.log('stop the maddness!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', Rooms.findOne({}).videoId);
                    //update marker with NEW old value. :(
                    Session.set("oldRoomVideoID", Rooms.findOne().videoId);
                    return;
                }
                console.log(id, 'I have observerd the video id has changed',fields.videoId);
                player.loadVideoById(fields.videoId, 1);
            }

            
            if (fields.like) {
                console.log('we have changed the rooms videos likes' );

                if (Number(fields.like) < 1) {
                    removeVideoAndLoad();
                }
            }

            if (fields.ownerId) {
                if (fields.ownerId === "") {
                    //console.log('I have observerd the owner has left');
                }else{
                    //console.log('we have a new room owner');
                    if (!Meteor.user() || !Session.get("isRoomOwner")) {
                        //console.log('we have a new room owner, its not me. update time');
                        //if not logged in....
                        var seconds = Rooms.findOne({}).playerCurrentTime;
                        //player.seekTo(seconds)
                        return;
                    }
                }
            }
        },
        movedBefore: function(id, fields) {
           console.log('movedBefore',id,fields);
        },
        removed: function(id) {

            console.log('removed id',id);
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
                'autoplay': 0,
                'showinfo': 0
            },
            videoId: videoId,
            events: {
                onReady: function(event) {
                    
                  //  debugger;

                    var room = Rooms.findOne({});
                    var seconds = 0;
                    if (room){
                        seconds = room.playerCurrentTime;
                        //event.target.playVideo();
                    }
                    
                    
                    if (!Meteor.user() || !Session.get("isRoomOwner")) {
                        //if not logged in....
                        //player.seekTo(seconds)
                        return
                    }

                },
                'onStateChange': function(evt) {
                    console.log("onsStateChange: " + evt.data);
                    if (evt.data == YT.PlayerState.ENDED) {
                       console.log('load it from player');
                       //removeVideoAndLoad();
                    }
                },
                'onError': function(evt) {
                    //console.log("onError: videoId: " + videoId + " error code" + evt.data);
                    displayAlert('Oh NO! That video be broken!');
                }
            }

        });

    };
    YT.load();
};

Template.mixtape.destroyed = function() {
    sAlert.closeAll();
};

///////////////////////////////////////////////////



/**
 * Removes the currently playing video and selects the next one updating the Room object video id.
 * @return {[type]} [description]
 */
function removeVideoAndLoad() {

    console.log('remove video');
    
    

    if ( Meteor.users.find({"status.online": true}).count() < 1) {
        displayAlert('No users are logged in so we have to stop until someone signs in');
        return;
    }

     console.log('there are users online');


    if (!Session.get("isRoomOwner")){
        return;
    }


     console.log('we are the owner');

    //var id = Rooms.findOne({}).videoId;
    var myid = Rooms.findOne().videoId
    if ( !myid ){
        console.log('there is no id.')
        return;
    }
return
    console.log('remove video' + Session.get("isRoomOwner"), myid);
    // Meteor.call('removeOneVideo', myid, function(error, result) {
        
    //     console.log('we removed the video');
    //     var roomId = Rooms.findOne({})._id;
    //     Rooms.update({_id: roomId}, {$set: {like: 3, playerCurrentTime:0}});
        
    //     var video = Videos.findOne({});

    //     if (!video){
    //         displayAlert('Oh NO! There are no more videos in the playlist. Can you SEARCH and add one?');
    //         return;
    //     }
    //     var videoId = video.videoId;
    //     //$('#content-container .btn-rate').attr('disabled', false);
    //     //Rooms.update({_id: roomId}, {$set: {videoId: videoId}});
    //     var updateQuery = {$set: {videoId: videoId}};
    //     Rooms.update({_id: roomId}, updateQuery, function (error) {
    //         //on error do this
    //         //debugger;
    //     });



    // });
}


function createRoom() {
    if (!Meteor.user()) {
        displayAlert('Hold On! You must be logged in to start this party!!');
        return;
    }

    var videoId = 'CvgqWO_TgP0';
    if (Videos.findOne({})) {
        var playlistVideoItem = Videos.findOne({}).videoId;
        if (playlistVideoItem) {
            videoId = playlistVideoItem;
        }
    }

    Rooms.insert({
        created_at: new Date(),
        playerCurrentTime: 0,
        ownerId: Meteor.user()._id,
        roomname: 'That is my jam',
        videoId: videoId,
        ownerHasNavigatedAway: false,
        like: 3
    });
}





// setInterval(function() {

//     if ( !player){
//         return
//     }

//     //room owner updates Room obj with current playhead time.
//     if (Session.get("isRoomOwner")) {
//         Meteor.call('updatePlayerCurrentTime', Meteor.user()._id, player.getCurrentTime(), function(err, response) {
//            // console.log("we did it. player.getCurrentTime()" + Meteor.user()._id);
//         });
//     }
// }, 2000);

///////////////////////////
function displayAlert(str)
{
     //sAlert.closeAll();
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
        added: function(user) {
            // id just came online
            var username = "no name";
            if (user.username)
                username = user.username;

            if (user.profile.name)
                username = user.profile.name;
        },
        removed: function(user) {
            var r = Rooms.findOne({});
            //console.log(username + ' has left the room. user._id: ' + user._id);
            //console.log('current room owner id is ' + r.ownerId);

            if (r.ownerId === user._id) {
                //console.log('the owner has left the room: ' + user._id);
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

        console.log('lets try and change the owner');

        var newOwner = Meteor.users.findOne({"status.online": true}, {sort: {createdAt: -1}});
        var roomId = Rooms.findOne({})._id;
        var newOwnerId = "";
        
        if (newOwner) {
            newOwnerId = newOwner._id;
        }
        console.log('roomId: ',roomId, ' newOwnerId ', newOwnerId);

       // var update = Rooms.update({_id: roomId}, {$set: {ownerId: newOwnerId}});

    }

}

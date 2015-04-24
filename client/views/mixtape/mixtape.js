

/*****************************************************************************/
/* mvar ixtape: Event Handlers and Helpersss .js*/
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

        Meteor.call('updateRoomLike', 1, function (error, result) {});
        App.helpers.setRoomAlert(App.helpers.getUserName() + ' just liked this video.');
    },

    'click .btn-hate': function(e, tmpl) {

        if (!Meteor.user()) {
           App.helpers.displayAlert('Hey! You must be logged in to hate on a video!');
            return;
        }

        
        if ( dissCount() > 2){
            App.helpers.displayAlert('You can only diss a song 3 times. Maybe someone else will cast the final diss? Message the group.');
            return;
        }

        Meteor.call('updateRoomLike', -1, function (error, result) {});
        App.helpers.setRoomAlert(App.helpers.getUserName() + ' just dissed this video.');
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
    },

    // hateBtnDisable: function() {
    //     var dissers = Rooms.findOne({}).dissers;
    //     var search = Meteor.user()._id;
    //     var count = dissers.reduce(function(n, val) {
    //         return n + (val === search);
    //     }, 0);
        
    //     return count;
    // }
});

function dissCount() {
    var dissers = Rooms.findOne({}).dissers;
    var count = 0;
    var userCount = Meteor.users.find({"status.online": true}).count();



    if ( userCount > 2 && dissers instanceof Array){
    var search = Meteor.user()._id;
    count = dissers.reduce(function(n, val) {
        return n + (val === search);
    }, 0);
    }

    return count;
}


/*****************************************************************************/
/* mixtape: Lifecycle Hooks */
/*****************************************************************************/
Template.mixtape.onCreated(function() {
    var self = this, mytimer,player;
    var rm = Rooms.findOne({});
    if (!rm){
        //this should never run after 1 room is created.
        App.helpers.createRoom();
    }else if (!rm.ownerId && Meteor.user()){
        //if we do NOT have a room owner but we do have 1 logged in user
        Meteor.call('updateRoomOwner', Meteor.user()._id, function (error, result) {});
    }

    App.helpers.setRoomAlertInfo("");

    self.subscribe("rooms", function(){
        //reactively track who the room owner is.
        Tracker.autorun(function () {
            if (!Meteor.user() )
            {
                //if this user is not logged in ....
                Session.set("isRoomOwner", false);
                return;
            }
            Session.set("isRoomOwner", Rooms.findOne({}).ownerId === Meteor.user()._id );
        });
    });
});

Template.mixtape.rendered = function() {
    var handleRoom = Rooms.find({}).observeChanges({
        
        changed: function(id, fields) {
            if (fields.videoId) {
                //video has changed. load the next one.
                player.loadVideoById(fields.videoId, 1);
                //close any alert.
                sAlert.closeAll();
                //remove all dislikes
                Meteor.call('removeAllDissers');
                //alert
                App.helpers.setRoomAlert('Playing a new song that was added by ' + Videos.findOne({}).userName + "!");
            }

            if (fields.like) {
                //user has modifed like. load new video if ...
                if (fields.like < 1) {
                    //player.seekTo(player.getDuration());
                    removeVideoAndLoad();
                    return;
                }
            }

            if (fields.ownerId) {
                //We are changing the owner id.
                if (!Meteor.user() || !Session.get("isRoomOwner")) {
                    //if not logged in or user is not the room owner .... get the current playhead time and apply.
                    //var seconds = Rooms.findOne({}).playerCurrentTime;
                    //player.seekTo(seconds)
                    if (adjustPlayhead ){
                        adjustPlayhead();
                    }
                    return;
                }
            }

            if (fields.alert){
                //display alert.
                App.helpers.displayAlert(fields.alert);
                //reset the Room alert value.
                App.helpers.setRoomAlert("");
            }

            if (fields.alertInfo){

                //console.log('fields.alertInfo: ');

                //display alert.
                App.helpers.displayAlertInfo(fields.alertInfo);
                //reset the Room alert value.
                App.helpers.setRoomAlertInfo("");
            }

            if (fields.playerCurrentTime){
                //console.log('player time has been updated', fields.playerCurrentTime);
                var curPlayTime = Number(fields.playerCurrentTime);
                var playerTime = Number(player.getCurrentTime());
                var diff = Math.abs(curPlayTime - playerTime);
                //console.log('diff',diff);
                if ( diff > 10)
                {
                    if ( !Session.get("isRoomOwner")){
                        //if not the room owner adjust the player time.
                       // console.log("diff tooo great. we will adjust they playhead!");
                        adjustPlayhead();
                    }
                }
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
                    
                   // startTrackPlayerTime();

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
                    //for custom playback progress bar.
                    if (evt.data == YT.PlayerState.PLAYING) {

                            $('#myprogressBar').show();
                                var playerTotalTime = player.getDuration();
                                mytimer = setInterval(function() {
                                var playerCurrentTime = player.getCurrentTime();
                                var playerTimeDifference = (playerCurrentTime / playerTotalTime) * 100;
                                progress(playerTimeDifference, $('#myprogressBar'));
                          }, 1000);        
                        } else {
                          
                          clearTimeout(mytimer);
                          $('#myprogressBar').hide();
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
    //console.log("adjustPlayhead: I just audjusted my playhead", Rooms.findOne({}).playerCurrentTime);
    player.seekTo(Rooms.findOne({}).playerCurrentTime)
}

function progress(percent, $element) {
  
   // console.log('progress', percent, $element)
  var progressBarWidth = percent * $element.width() / 100;

// $element.find('div').animate({ width: progressBarWidth }, 500).html(percent + "%&nbsp;");

  $element.find('div').animate({ width: progressBarWidth });
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
    //get the currently selected video.
    var roomVideoId = Rooms.findOne({}).videoId, video = Videos.findOne({});

    //if there is no room id or there are no qued up videos in the common video play list.
    if ( !roomVideoId || !video){
        App.helpers.displayAlertInfo('Oh no! There are no more videos in the playlist. Can you SEARCH and add one?');
    }

    if ( Session.get("isRoomOwner")){
        player.stopVideo();
    }else{
        adjustPlayhead();
        //if not room owner stop here.
        return;
    }

    //Make server side call to remove the current vidoo and load the next one.
    //Only Room owner will get here.
    Meteor.call('removeOneVideo', roomVideoId, function(error, result) {
        
        var video = Videos.findOne({});
        if (!video){
            App.helpers.setRoomAlertInfo('Oh no! There are no more videos in the playlist. Can you SEARCH and add one?');
            return;
        }

        Meteor.call('updateRoomVideoID', video.videoId, function (error, result) {});
    });
}

///////////////////////////////////////////////////
// function startTrackPlayerTime(){
//     setInterval(function() {

//         if (!player) {
//             return
//         }

//         //room owner updates Room with current playhead time.
//         if (Session.get("isRoomOwner")) {
//             Meteor.call('updatePlayerCurrentTime', Meteor.user()._id, player.getCurrentTime(), function(err, response) {
//                 // console.log("we did it. player.getCurrentTime()" + Meteor.user()._id);
//             });
//         }
//     }, 2000);
// }


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
           var rm = Rooms.findOne({});

            //if the Room ownerID is not online ... update the room owner.
            if ( Meteor.users.find({_id:rm.ownerId, "status.online": true}).count() < 1){
                App.helpers.changeRoomOwner();
                return;
            }

            if ( Session.get("isRoomOwner") && typeof player !== 'undefined'){
                Meteor.call('updatePlayerCurrentTime', player.getCurrentTime(), function(err, response) {
                   // console.log("updatePlayerCurrentTime: we did it. player.getCurrentTime:" + player.getCurrentTime());
                });
            }


        },
        removed: function(user) {

            // just came online
            var username = "no name";
            if (user && user.username)
                username = user.username;

            if (user && user.profile.name)
                username = user.profile.name;

           App.helpers.setRoomAlert(username + ' just left the party!', true)

            var r = Rooms.findOne({});
            if (r.ownerId === user._id) {
               // console.log('the owner has left the room: ' + user._id);
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

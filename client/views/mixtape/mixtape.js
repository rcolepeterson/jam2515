/*****************************************************************************/
/* mixtape: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.mixtape.events({
    'click .btn-like': function(e, tmpl) {
        if (!Meteor.user()) {
            sAlert.error('Hey! You must be logged in to like a video!', {
                effect: 'genie',
                position: 'right-bottom',
                timeout: 3000
            });
            return;
        }
        //max is 6.
        if (this.like > 5)
            return false

        Rooms.update({
            _id: this._id
        }, {
            $inc: {
                like: 1
            }
        });

        // $('#content-container .btn-like').attr('disabled', true);
    },

    'click .btn-hate': function(e, tmpl) {

        if (!Meteor.user()) {
            sAlert.error('Hey! You must be logged in to hate on a video!', {
                effect: 'genie',
                position: 'right-bottom',
                timeout: 3000
            });
            return;
        }


        Rooms.update({
            _id: this._id
        }, {
            $inc: {
                like: -1
            }
        });

        //$('#content-container .btn-hate').attr('disabled', true);
    },
    'click .btn-becomeOwner': function(e, tmpl) {

        var roomId = Rooms.findOne({})._id;
        console.log('roomId: ' + roomId)
        Rooms.update({
            _id: roomId
        }, {
            $set: {
                ownerId: Meteor.user()._id
            }
        });
    },

    'click .btn-next': function(e, tmpl) {
        if (!isRoomOwner())
            return;

        removeVideoAndLoad()
    }
});


Template.mixtape.helpers({

    room: function() {
        return Rooms.findOne({}, {
            sort: {
                created_at: -1
            }
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
    },
    ownerHasNavigatedAway:function(){
        return Rooms.findOne({}).ownerHasNavigatedAway;
    }


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

// Meteor.users.find({
//     "status.online": true
// }).observe({
//     added: function(user) {
//         // id just came online
//         var username = "anon";
//         userName = Meteor.user().username || Meteor.user().profile.name;
//         console.log(username + ' just came online');
//     },
//     removed: function(user) {
//         var r = Rooms.findOne({});
//         console.log('who has left the room: ' + user._id);
//         if (r.ownerId === user._id) {
//             // if (typeof player !== 'undefined') {
//             //     try {
//             //         player.stopVideo();
//             //     } catch (err) {
//             //         console.log('error');
//             //     }
//             // }

//             console.log('the owner has left the room: ' + user._id);
//             //destroy room and put everyone back to start. so someone can create the room.
//             //Meteor.call('removeallRooms');
//             // sAlert.error('OH NO! The guy who started the room left! Start a new party.', {
//             //     effect: 'genie',
//             //     position: 'right-bottom',
//             //     timeout: 3000
//             // });
//             //Router.go("Home");
//             // console.log('newOwnerId', r.ownerId);

//             //update room owner
//             var newOwner = Meteor.users.findOne({"status.online": true},{sort: {createdAt: -1}});
//             console.log('newOwner ' + newOwner);
//             if ( newOwner )
//             {

//                 var newOwnerId = newOwner._id; 
//                 console.log('newOwnerId ', newOwnerId);


//                 Rooms.update({
//                         _id: r._id
//                     }, {
//                         $set: {
//                             ownerId: newOwnerId
//                         }
//                     });

//                 console.log(user._id + ' just came offline. room owner id: ',r._id);
//             }
//         }
//     }
// });

/*****************************************************************************/
/* mixtape: Lifecycle Hooks */
/*****************************************************************************/


Template.mixtape.onCreated(function() {
    var self = this;
    // When this template is used, get
    // the data we need.
    self.autorun(function() {
        self.subscribe("rooms");
    });
});

Template.mixtape.rendered = function() {

    Rooms.find({}).observeChanges({
        added: function(id, fields) {
            // ...
        },
        // Use either added() OR(!) addedBefore()
        // addedBefore: function (id, fields, before) {
        //     // ...
        // },
        changed: function(id, fields) {
            if (fields.videoId) {
                player.loadVideoById(fields.videoId);
            }

            if (fields.like) {
                if (Number(fields.like) < 1) {
                    removeVideoAndLoad();
                }
            }

            if ( fields.ownerId )
            {
                
                if ( fields.ownerId === "")
                {
                    console.log('fucking owner left');
                }
            }
        },
        movedBefore: function(id, fields) {
            // ...
        },
        removed: function(id) {

            // ...
        }
    });


    var room = Rooms.findOne({});
    if (!room) {
        return;
    }

    var videoId = room.videoId;

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
                    var room = Rooms.findOne({}),
                        seconds = room.playerCurrentTime;
                    event.target.playVideo();
                    if (!Meteor.user() || !isRoomOwner()) {
                        //if not logged in....
                        player.seekTo(seconds)
                        return;
                    }

                    if (isRoomOwner()) {
                        //if owner track play back on Room Object.
                        setInterval(function() {
                            Meteor.call('updatePlayerCurrentTime', Meteor.user()._id, player.getCurrentTime(), function(err, response) {
                                //console.log("we did it. player.getCurrentTime()" + response);
                            });
                        }, 1000);
                    }
                },
                'onStateChange': function(evt) {
                    console.log("onsStateChange: " + evt.data);
                    if (evt.data == YT.PlayerState.ENDED) {
                        removeVideoAndLoad();
                    }
                },
                'onError': function(evt) {
                    console.log("onError: videoId: " + videoId + " error code" + evt.data);

                    sAlert.error('Oh NO! That video be broken!', {
                        effect: 'genie',
                        position: 'right-bottom',
                        timeout: 3000
                    });
                    //  var interval = Meteor.setInterval(function() {
                    //     removeVideoAndLoad();
                    //     Meteor.clearInterval(interval);
                    // }, 2000);
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
 * isRoomOwner:  Is this user the current room owner? Based on room owner id && Meteor user id.
 * @return {Boolean} denotes if this user is the Room Owner.
 */
function isRoomOwner() {
    var val = false,
        room = Rooms.findOne({});
    if (!Meteor.user()) {
        val = false;
    } else if (room.ownerId === Meteor.user()._id) {
        val = true;
    }

    return val;
}

/**
 * Removes the currently playing video and selects the next one updating the Room object video id.
 * @return {[type]} [description]
 */
function removeVideoAndLoad() {

        if (!isRoomOwner())
            return;

        var id = Rooms.findOne({}).videoId;
        Meteor.call('removeOneVideo', id, function(error, result) {
            var video = Videos.findOne({});
            if (!video) {
                sAlert.error('Oh NO! There are no more videos in the playlist. Can you add one?', {
                    effect: 'genie',
                    position: 'right-bottom',
                    timeout: 3000
                });

                return;
            }

            var videoId = video.videoId;
            var roomId = Rooms.findOne({})._id;
            $('#content-container .btn-rate').attr('disabled', false);
            Rooms.update({
                _id: roomId
            }, {
                $set: {
                    videoId: videoId,
                    like: 3
                }
            }, {
                multi: false
            });
        });
    }
    ////////////////////////////////////////////////////

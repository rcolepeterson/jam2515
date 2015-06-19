Template.admin.onCreated(function() {

    //if (window.location.host === 'localhost:3000') {

        var self = this;
        self.autorun(function() {
            self.subscribe("rooms");
        });

        $('body').on('keydown', function(e) {
            if (e.ctrlKey && e.keyCode == 69) {
                $('#admin').toggle();
            }
        });
   // }
});



Template.admin.events({
    'click .btn-becomeOwner': function(e, tmpl) {
        if (!Rooms.findOne({})) {
            return;
        }

        Meteor.call('becomeRoomOwner', function (error, result) {
            console.log('you have become the room owner');
        });
    },
    'click .testUpdatePlayBack': function(e,tmpl)
    {
        //only people who are not the room owner will be affected.
        Meteor.call('updatePlayerCurrentTime', Number($('#test-playback-input').val()), function (error, result) {});
    },

    'click .btn-StopBeOwner': function(e, tmpl) {
        Meteor.call('updateRoomOwner', 0, function (error, result) {});
    },

    'click .btn-next': function(e, tmpl) {
        
        var id = Rooms.findOne({}).videoId;
        Meteor.call('removeOneVideo', id, function(error, result) {
            console.log('we removed the video');
            // var video = Videos.findOne({});
            // var videoId = video.videoId;
            // var roomId = Rooms.findOne({})._id;
        });
    },
    'click #removeAllVideos': function(e, tmpl) {
        Meteor.call('removeAllVideos');
    },
    'click #removeallMsgs': function(e, tmpl) {
        Meteor.call('removeAllMessages');
    },
    'click #removeUserBtn': function(e, tmpl) {
        var id = Meteor.user()._id;
        Meteor.call('removeUser', id, function(err, response) {
            console.log("Admin: we did it. removed" + response);
        });
    },
    'click #removeallRooms': function(e, tmpl) {
        Meteor.call('removeallRooms');
    },
    'click #createRoom': function(e, tmpl) {
        createRoom();
    },

    'click .testUpdateRoomID': function(e, tmpl) {
        var roomId = Rooms.findOne()._id;
        Rooms.update({_id:roomId}, {$set: {videoId:'test'}}, function(err){
            console.log(Rooms.findOne({}).videoId,' room call back. err? ',err);
       });   
    }

   

});

Template.admin.helpers({

    isYourRoom: function() {
        return Session.get("isRoomOwner");
    },
    roomOwnerId: function() {
        var room = Rooms.findOne({});
        if (room) {
            return room.ownerId;
        }
        return 'Admin: No rooom owner id';
    }
});

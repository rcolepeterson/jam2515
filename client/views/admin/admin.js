Template.admin.onCreated(function() {
    var self = this;
    self.autorun(function() {
        self.subscribe("rooms");
    });

    $('body').on('keydown', function(e) {
        if (e.ctrlKey && e.keyCode == 86) {
            $('#admin').toggle();
        }
    });
});


Template.admin.events({
    'click .btn-becomeOwner': function(e, tmpl) {

        if (!Rooms.findOne({})) {
            return;
        }

        var roomId = Rooms.findOne({})._id;
        //console.log('admin is becoming room owner: roomId: ' + roomId)
        Rooms.update({_id: roomId}, {
            $set: {
                ownerId: Meteor.user()._id
            }
        });
    },

    'click .btn-StopBeOwner': function(e, tmpl) {
        var roomId = Rooms.findOne({})._id;
        //console.log('stop: being owner',roomId);
        Rooms.update({_id: roomId}, {$set: {ownerId: "555"}});
    },

    'click .btn-next': function(e, tmpl) {
        console.log('Admin: get next video');
        var id = Rooms.findOne({}).videoId;
        console.log('remove video' + Session.get("isRoomOwner"), id);
        Meteor.call('removeOneVideo', id, function(error, result) {
            console.log('we removed the video');
            var video = Videos.findOne({});
            var videoId = video.videoId;
            var roomId = Rooms.findOne({})._id;
    //        Rooms.update({_id: roomId}, {$set: {videoId: videoId, slike: 3}});
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

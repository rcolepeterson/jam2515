Meteor.methods({
   
    removeAllVideos: function() {
        return Videos.remove({});
    },

    removeAllMessages: function() {
        return Messages.remove({});
    },

    removeOneVideo: function(_id) {
        return Videos.remove({
            videoId: _id
        });
    },
    removeUser: function(_id) {
        return Meteor.users.remove(_id);
    },
    removeallRooms: function() {
        return Rooms.remove({});
    },
    updatePlayerCurrentTime: function(_id, playerCurrentTime) {
        Rooms.update({
            ownerId: _id
        }, {
            $set: {
                playerCurrentTime: playerCurrentTime
            }
        }, {
            multi: false
        });
    },
    updateRoomOwner: function(_id) {
        console.log('updateRoomOwner: ' + _id);
        var curRommId = Rooms.findOne({})._id;
        Rooms.update({
            _id: curRommId
        }, {
            $set: {
                ownerId: _id
            }
        }, {
            multi: false
        });
    }
});

Meteor.methods({
    setUserPic: function setUserPic(avatar) {
        return Meteor.users.update({
            _id: CurrentUserId
        }, {
            $set: {
                'profile.picture': avatar
            }
        });
    }
});

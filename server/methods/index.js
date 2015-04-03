Meteor.methods({

    removeAllVideos: function() {
        return Videos.remove({});
    },

    removeAllMessages: function() {
        return Messages.remove({});
    },

    removeOneVideo: function(_id) {
        return Videos.remove({videoId: _id});
    },

    removeUser: function(_id) {
        return Meteor.users.remove(_id);
    },

    removeallRooms: function() {
        return Rooms.remove({});
    },

    updatePlayerCurrentTime: function(playerCurrentTime) {
        var roomId = Rooms.findOne({})._id;
        return Rooms.update({_id:roomId}, {$set: {playerCurrentTime: playerCurrentTime}});
    },

    updateRoomOwner: function(_id) {
        var roomId = Rooms.findOne({})._id;
        return Rooms.update({_id: roomId}, {$set: {ownerId: _id}});
    },

    updateRoomLike: function(n) {
        var roomId = Rooms.findOne({})._id;
        return Rooms.update({_id: roomId}, {$inc: {like: n}});
    },

    updateRoomVideoID: function(videoId) {
        var roomId = Rooms.findOne({})._id;
        var c = Rooms.update({_id: roomId}, {$set: {videoId: videoId, like: 3}},function(err,result){
            return result;
        });
    },
    
    setRoomAlert: function(str) {
     var roomId = Rooms.findOne({})._id;
     Rooms.update({_id: roomId}, {$set: {alert: str}},
         function(error, result) {
             if (error) {
                 throw new Meteor.Error(500, error.message);
             } else {
                 return result;
             }
         }
     );
 },

    /**
     * [newVideo description]
     * @param  {[type]} userId          [description]
     * @param  {[type]} userName        [description]
     * @param  {[type]} userImage       [description]
     * @param  {[type]} youtubeData     [description]
     * @return {[type]}                 [description]
     */
    newVideo: function(userId, userName, userImage, youtubeData) {
        Videos.insert({
                created_at: new Date(),
                userId: userId,
                userName: userName,
                userImage: userImage,
                videoId: youtubeData.id,
                videoThumb: youtubeData.thumbnail.hqDefault,
                videoDesc: youtubeData.description,
                videoTitle: youtubeData.title,
                like: 3
            },
            function(err, id) {
                var roomId = Rooms.findOne()._id;
                var count = Videos.find({}).count();
                var insertedvideo = Videos.findOne({_id: id});
                //we just inserted the 1st video. update the Rooms obj which will start the player.
                if (count === 1) {
                    Rooms.update({_id: roomId}, {$set: { videoId: insertedvideo.videoId, like:3}}, function(err) {});
                }
            });
    },
    /**
     * Updates the user's profile picture.
     * CurrentUserId is the user's meteor id. we define this on load @ /server/publish/index.js.
     * @param {string} avatar [path to image]
     */
    setUserPic: function setUserPic(avatar) {
        return Meteor.users.update({_id: CurrentUserId}, {$set: {'profile.picture': avatar}
        });
    }
});
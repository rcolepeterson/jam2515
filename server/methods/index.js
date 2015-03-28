Meteor.methods({

    removeAllVideos: function() {
        return Videos.remove({});
    },

    removeAllMessages: function() {
        return Messages.remove({});
    },

    removeOneVideo: function(_id) {
        //console.log('Server: We are removing', _id)
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
        //console.log('updateRoomOwner: ' + _id);
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
    },
    updateRoomVideoID: function(videoId) {
        //console.log('updateVideoID: ' + videoId);
        var curRommId = Rooms.findOne({})._id;
        //console.log('curRommId ' + curRommId)
        Rooms.update({
            _id: curRommId
        }, {
            $set: {
                videoId: videoId
            }
        }, {
            multi: false
        });
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
                var insertedvideo = Videos.findOne({
                    _id: id
                });
                //we just inserted the 1st video. update the Rooms obj which will start the player.
                if (count === 1) {
                    Rooms.update({
                        _id: roomId
                    }, {
                        $set: {
                            videoId: insertedvideo.videoId
                        }
                    }, function(err) {});
                }
            });
    },
    /**
     * Updates the user's profile picture.
     * CurrentUserId is the user's meteor id. we define this on load @ /server/publish/index.js.
     * @param {string} avatar [path to image]
     */
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

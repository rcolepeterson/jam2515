Meteor.methods({

    removeAllVideos: function() {
        return Videos.remove({});
    },

    removeAllMessages: function() {
        return Messages.remove({});
    },

    removeOneVideo: function(_id) {
        console.log('Server: We are removing', _id)
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
    },
    /**
     * [updateRoomVideoID description]
     * @param  {[type]} videoId [description]
     * @return {[type]}         [description]
     */
    updateRoomVideoID: function(videoId) {
        var curRommId = Rooms.findOne({})._id;
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
     * @param  {[type]} userId    [description]
     * @param  {[type]} userName  [description]
     * @param  {[type]} userImage [description]
     * @param  {[type]} data      [description]
     * @return {[type]}           [description]
     */
    newVideo: function(userId,userName,userImage,youtubeDataObj) {
        Videos.insert({
            created_at: new Date(),
            userId: userId,
            userName: userName,
            userImage: userImage,
            videoId: youtubeDataObj.id,
            videoThumb: youtubeDataObj.thumbnail.hqDefault,
            videoDesc: youtubeDataObj.description,
            videoTitle: youtubeDataObj.title,
            like:3
        },function(err, id){
           
            var roomId = Rooms.findOne()._id;
            var count = Videos.find({}).count();
            var insertedvideo = Videos.findOne({_id:id});
            
            //we just inserted the 1st video. start the player.
            if ( count === 1){
                Rooms.update({_id:roomId}, {$set: {videoId:insertedvideo.videoId}}, function(err){
                }); 
            }
        });
    },
    /**
     * [setUserPic description]
     * @param {[type]} avatar [description]
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

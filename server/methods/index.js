//http://stackoverflow.com/questions/11801278/accessing-meteor-production-database
//
//
 YoutubeApi.authenticate({
        type: 'key',
        key: 'AIzaSyBU9A6sLsAGQRxuGhp6wqPQpEEvnl2XT78'
    });

Meteor.methods({

    becomeRoomOwner:function(){
        var roomId = Rooms.findOne({})._id;
        return Rooms.update({_id: roomId}, {
            $set: {
                ownerId: Meteor.user()._id
            }
        });
    },

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

    //only people who are not the room owner will be affected.
    updatePlayerCurrentTime: function(playerCurrentTime) {
        var roomId = Rooms.findOne({})._id;
        return Rooms.update({_id:roomId}, {$set: {playerCurrentTime: playerCurrentTime}});
    },

    updateRoomOwner: function(_id) {
        var roomId = Rooms.findOne({})._id;
        return Rooms.update({_id: roomId}, {$set: {ownerId: _id}});
    },

    updateRoomLike: function(n) {
        //console.log('user' , Meteor.user()._id);
        var roomId = Rooms.findOne({})._id;
        if ( n < 0){
            //record person who dissed.
            if ( !Rooms.findOne({}).dissers ){
                Rooms.update({_id: roomId}, {$set: {dissers: []}});
            }

            Rooms.update({_id: roomId}, {$push: {dissers: Meteor.user()._id}});

        }   
        
        return Rooms.update({_id: roomId}, {$inc: {like: n}});
    },
    //db.rooms.update({_id: '4vnTZvQDsNjGkExPQ'}, {$set: {alert: "test"}});
    /**
     * Emptys out the diss array. Fired when video changes.
     * @return {[type]} [description]
     */
    removeAllDissers:function(){
        var roomId = Rooms.findOne({})._id;
        Rooms.update({_id: roomId}, {$set: {dissers: []}},{multi:true});
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
    setRoomAlertInfo: function(str) {

     //console.log('setRoomAlertInfo: ',str);
     var roomId = Rooms.findOne({})._id;
     Rooms.update({_id: roomId}, {$set: {alertInfo: str}},
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
                videoId: youtubeData.id.videoId,
                videoThumb: youtubeData.snippet.thumbnails.medium.url,
                videoDesc: youtubeData.snippet.description,
                videoTitle: youtubeData.snippet.title,
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
    },

    ////search////
   

        searchVideo: function(keyword) {
        //execution pause here until done() callback is called.
            //https://github.com/meteorhacks/npm
        var results = Meteor.sync(function(done) {
          YoutubeApi.search.list({
                part: "snippet",
                type: "video",
                maxResults: 10,
                q: keyword,
                videoDuration:"short"
            }, function (err, data) {
                
            done(err, data);
          });
        });
        if(results.error) {
          throw new Meteor.Error(401, results.error.message);
        }else{
         
          return results.result;
        }
      }
    
   
});
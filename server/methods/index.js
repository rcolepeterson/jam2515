Meteor.methods({
    removeAllSongofthedayVideos: function() {
        return Songoftheday.remove({});
    },
    removeAllVideos: function() {
        return Videos.remove({});
    },
    removeUser:function(_id){
    	return Meteor.users.remove(_id);
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

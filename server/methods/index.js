Meteor.methods({
    removeAllVideos: function() {
        return Videos.remove({});
    }
});

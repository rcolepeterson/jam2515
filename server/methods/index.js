Meteor.methods({
    removeAllVideos: function() {
        return Videos.remove({});
    }
});

Meteor.methods({
    removeAllSongofthedayVideos: function() {
        return Songoftheday.remove({});
    }
});

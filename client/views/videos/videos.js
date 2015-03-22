Template.Videos.helpers({
    videos: function() {
        return Videos.find({}, {
            sort: {
                created_at: 1
            }
        })
    }
});
Template.mixtape.events({
    'click .btn-video': function(e, tmpl) {
		var rId = Rooms.findOne({})._id;
		var videoId = Videos.findOne({}).videoId;
        Rooms.update({
            _id: rId
        }, {
            $set: {
                videoId: videoId
            }
        }, {
            multi: false
        });
    }
});

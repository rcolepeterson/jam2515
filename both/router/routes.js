/*****************************************************************************/
/* Client and Server Routes */
/*****************************************************************************/
Router.configure({
    layoutTemplate: 'MasterLayout',
    loadingTemplate: 'Loading',
    notFoundTemplate: 'NotFound'
});

Router.route('/', {
    name: 'Home',
    template: 'Home',
    waitOn: function() {
        console.log('waiton');
        return [Meteor.subscribe('rooms'), Meteor.subscribe("userStatus"), Meteor.subscribe('videos')]
    },
    data: function() {
       // console.log('data');
    },
    action: function() {
        console.log('action');
        //TODO: if a room owner has come here. remove and make some one else room owner.
        if ( Rooms.findOne({})){
            var uId = Meteor.user()._id;
            var rId = Rooms.findOne({}).ownerId;
            
            if ( uId === rId)
            {
                console.log("the owner has left the player");
                var roomId = Rooms.findOne({})._id;
                var update = Rooms.update({_id: roomId}, {$set: {ownerId: ""}});
            }
        }
        this.render('Home');
    }
});

Router.route('/mixtape', {
    name: 'mixtape',
    template: 'mixtape',
    waitOn: function() {
        return [Meteor.subscribe('rooms'), Meteor.subscribe('videos'), Meteor.subscribe("messages"), Meteor.subscribe("userStatus")]
    },
    data: function() {

        // if (Rooms.find().fetch().length === 0) {
        //     Router.go('Home');
        //     return;
        // }

        //console.log('Router data has been called.')
        //do we have a room?
        var room = Rooms.findOne({}, {
            sort: {
                created_at: -1
            }
        });
        return room;
    },
    action: function() {
        this.render('mixtape');
    }
});

if (Meteor.isClient) {
    Meteor.users.find({
        "status.online": true
    }).observe({
        added: function(user) {
            // id just came online
            var username = "no name";
            if (user.username)
                username = user.username;

            if (user.profile.name)
                username = user.profile.name;

            console.log(username + ' just came online');
        },
        removed: function(user) {

            var username = "no name";
            if (user.username)
                username = user.username;

            //hack for Twiiter users. @todo - fix account login so this is normalized.
            if (user.profile.name)
                username = user.profile.name;

            var r = Rooms.findOne({});
            console.log(username + ' has left the room. user._id: ' + user._id);
            console.log('current room owner id is ' + r.ownerId);

            if (r.ownerId === user._id) {
                console.log('the owner has left the room: ' + user._id);
                //update room owner
                //chnageRoomOwner();
            }
        }
    });

    /**
     * Changes the owner of the room.
     * @param  {[type]} roomId [description]
     * @return {[type]}        [description]
     */
    function chnageRoomOwner() {

        var newOwner = Meteor.users.findOne({"status.online": true}, {sort: {createdAt: -1}});
        var roomId = Rooms.findOne({})._id;

        if (newOwner) {
            console.log('newOwner: ' + newOwner.username);
        }else{
            console.log('noone is available to be the new owner');
            Router.go('Home');
        }

        var newOwnerId = newOwner._id;
        console.log('roomId: ',roomId, ' newOwnerId ', newOwnerId);

        var update = Rooms.update({_id: roomId}, {$set: {ownerId: newOwnerId}});
        console.log("update: " + update)
        //test
        var newr = Rooms.findOne({});
        console.log('we have a new room owner id: ', newr.ownerId);

        //update player seek time
        // Meteor.call('updatePlayerCurrentTime', newOwner._id, player.getCurrentTime(), function(err, response) {
        //     console.log("we did it. player.getCurrentTime()" + response);
        // });

    }

}

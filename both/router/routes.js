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
        return [Meteor.subscribe('rooms')]
    },
    data: function() {
    },
    action: function() {
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
        
        if (Rooms.find().fetch().length === 0) {
            Router.go('Home');
            return;
        }

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

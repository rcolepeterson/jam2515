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
    action: function() {
        Router.go('mixtape');
    }
});

Router.route('/mixtape', {
    name: 'mixtape',
    template: 'mixtape',
    waitOn: function() {
        return [Meteor.subscribe('rooms'), Meteor.subscribe('videos'), Meteor.subscribe("messages"), Meteor.subscribe("userStatus")]
    },
    data: function() {
        //do we have a room?
        var room = Rooms.findOne({}, {
            sort: {
                created_at: -1
            }
        });
        return room;
    },
    action: function() {

        if (this.ready()){
            console.log('we are ready');
            this.render('mixtape')
        }else{
            console.log('we are loading');
            this.render('Loading');
        }
        //this.render('mixtape');
    }
});



/*****************************************************************************/
/* Home: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Home.events({
    'click #removeall': function(e, tmpl) {
        Meteor.call('removeAllVideos');
        e.preventDefault();
    },

    'click #removeallSOD': function(e, tmpl) {
        Meteor.call('removeAllSongofthedayVideos');
        e.preventDefault();
    },
});

Template.Home.helpers({
    songofthedayID: function() {
        return Songoftheday.findOne({}, {
            sort: {
                created_at: -1
            }
        }).video._id;
    }
});

/*****************************************************************************/
/* Home: Lifecycle Hooks */
/*****************************************************************************/
Template.Home.created = function() {};

Template.Home.rendered = function() {
    //center assets. takes care of vendor prefixes.
    TweenMax.set(".centerMe", {
        xPercent: -50,
        yPercent: -50
    });

    //sAlert.error('Boom! Something went wrong!', {effect: 'genie', position: 'right-bottom', timeout: 'no'});
};

Template.Home.destroyed = function() {};

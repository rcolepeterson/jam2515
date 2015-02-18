/*****************************************************************************/
/* Videos: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Videos.events({
    'click .sodBtn': function(e, tmpl) {

        var m = Meteor.user();
        if (!m || m.emails[0].address !== 'colep@zaaz.com') {

            sAlert.error('Boom! You must be an admin select a video of the day!', {
                effect: 'genie',
                position: 'right-bottom',
                timeout: 3000
            });
            return;
        }


        Songoftheday.insert({
            video: this,
            created_at: new Date()
        });
    }
});

Template.Videos.helpers({
    videos: function() {
        var sessiontag = Session.get("tag");
        var filterByTag = {};
        if (sessiontag) {
            filterByTag = Session.get("tag");
            if (sessiontag.tag === 'All') {
                filterByTag = {};
            }
        }
        return Videos.find(filterByTag, {
            sort: Session.get("sort_order")
        });
    },
    todaysdate: function() {

        var today = new Date();
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
        ];
        var dd = today.getDate();
        var mm = today.getMonth();
        var yyyy = today.getFullYear();
        return monthNames[mm] + " " + dd;
    }

});

Template.VideoItem.helpers({
    isAdmin: function()
    {
        console.log(Meteor.user(), Meteor.user().emails[0].address);
        if (Meteor.user() && Meteor.user().emails[0].address === 'colep@zaaz.com') {
            return true;
        }else{
            return false;
        }
    }

});


/*****************************************************************************/
/* Videos: Lifecycle Hooks */
/*****************************************************************************/
Template.Videos.created = function() {};

Template.Videos.rendered = function() {
    if (Session.get("sort_order") === undefined) {
        Session.setDefault("sort_order", {
            created_at: -1
        });
    }
};

Template.Videos.destroyed = function() {};

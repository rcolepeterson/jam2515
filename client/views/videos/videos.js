/*****************************************************************************/
/* Videos: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Videos.events({
  /*
   * Example:
   *  'click .selector': function (e, tmpl) {
   *
   *  }
   */
});

Template.Videos.helpers({
    videos: function() {
        var sessiontag = Session.get("tag");
        var filterByTag = {};
        if (sessiontag) {
            filterByTag = Session.get("tag");
            //console.log("sessiontag.tag " + sessiontag.tag);
            if (sessiontag.tag === 'All') {
                filterByTag = {};
            }
            //console.log("filterByTag " + filterByTag);
            //console.log('Session sort order' + Session.get("sort_order"))
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

/*****************************************************************************/
/* Videos: Lifecycle Hooks */
/*****************************************************************************/
Template.Videos.created = function () {
};

Template.Videos.rendered = function() {
    if (Session.get("sort_order") === undefined) {
        Session.setDefault("sort_order", {
            created_at: -1
        });
    }
};

Template.Videos.destroyed = function () {
};
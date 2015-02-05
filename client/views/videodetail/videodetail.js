/*****************************************************************************/
/* Videodetail: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Videodetail.events({
    /*
     * Example:
     *  'click .selector': function (e, tmpl) {
     *
     *  }
     */
});

Template.Videodetail.helpers({
    /*
     * Example:
     *  items: function () {
     *    return Items.find();
     *  }
     */
});

/*****************************************************************************/
/* Videodetail: Lifecycle Hooks */
/*****************************************************************************/
Template.Videodetail.created = function() {

    console.log('get video ' + Router.current().params._id);
    var videoId = Router.current().params._id || "LdH1hSWGFGU";
    var me = this;

    // YouTube API will call onYouTubeIframeAPIReady() when API ready.
    // Make sure it's a global variable.
    onYouTubeIframeAPIReady = function() {

        // New Video Player, the first argument is the id of the div.
        // Make sure it's a global variable.
        player = new YT.Player("player", {

            height: "400",
            width: "600",

            // videoId is the "v" in URL (ex: http://www.youtube.com/watch?v=LdH1hSWGFGU, videoId = "LdH1hSWGFGU")
            videoId: Router.current().params._id,

            // Events like ready, state change, 
            events: {

                onReady: function(event) {

                    // Play video when player ready.
                    event.target.playVideo();
                }

            }

        });

    };

    YT.load();
};

Template.Videodetail.rendered = function() {




};

Template.Videodetail.destroyed = function() {};

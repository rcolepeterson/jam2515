/*****************************************************************************/
/* Videodetail: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Videodetail.events({
    'click .btn-like': function(e, tmpl) {
        Videos.update({
            _id: this._id
        }, {
            $inc: {
                like: 1
            }
        });
    }
});

Template.Videodetail.helpers({
    //Example:
    videoitem: function() {
        var id = Router.current().params._id || "LdH1hSWGFGU";
        var obj = Videos.findOne({
            _id: id
        });
        return obj;
    }

});

// function getNextVideo() {
//     var upcoming_games = Videos.find({
//     }, {
//         sort: {
//             hype: -1,
//             submitted: 1
//         },
//         limit: 10
//     }).fetch();

//     var upcoming_games_modified = upcoming_games;

//     upcoming_games.forEach(function(game, index) {
//         if (game._id === current_game_id)
//             upcoming_games = upcoming_games_modified.splice(index);
//     });

//     return upcoming_games[skip + 1]._id;
// }

/*****************************************************************************/
/* Videodetail: Lifecycle Hooks */
/*****************************************************************************/
Template.Videodetail.created = function() {
    var id = Router.current().params._id || "LdH1hSWGFGU";
    var obj = Videos.findOne({
        _id: id
    });

    // debugger;

    if (!obj) {

        sAlert.error('Boom! Something went wrong! Missing JAM', {
            effect: 'genie',
            position: 'right-bottom',
            timeout: 'no'
        });
        return
    }

    //debugger;

    var videoId = obj.videoId;
    var me = this;

    // YouTube API will call onYouTubeIframeAPIReady() when API ready.
    // Make sure it's a global variable.
    onYouTubeIframeAPIReady = function() {

        // New Video Player, the first argument is the id of the div.
        // Make sure it's a global variable.
        player = new YT.Player("player", {

            height: "400",
            width: "600",
            playerVars: {
                'modestbranding': 1,
                'controls': 1,
                'autohide': 0
            },
            // videoId is the "v" in URL (ex: http://www.youtube.com/watch?v=LdH1hSWGFGU, videoId = "LdH1hSWGFGU")
            videoId: videoId,

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

    $('.videoInfo .s-alert-close').on('click', function() {
        $('.videoInfo').css('display', 'none');
    })


};

Template.Videodetail.destroyed = function() {

    sAlert.closeAll();

};

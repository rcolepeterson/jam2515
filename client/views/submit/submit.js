/*****************************************************************************/
/* Submit: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Submit.events({
    'click .submitFormBtn': function(e, tmpl) {

        if (!Meteor.user()) {
            sAlert.error('Hey! You must be logged in to post a video!', {
                effect: 'genie',
                position: 'right-bottom',
                timeout: 3000
            });
            return;
        }

        var id = $(e.currentTarget).data("id");
        var data = localVideoCollection.findOne({_id: id}).data;
        var userName = Meteor.user().username || Meteor.user().profile.name || "anon";
        var userImage = Meteor.user().profile.picture;
        var userId = Meteor.user()._id;

        if (Meteor.user().profile && Meteor.user().profile.picture) {
            postAuthorImage = Meteor.user().profile.picture;
        }

        Videos.insert({
            created_at: new Date(),
            userId: userId,
            userName: userName,
            userImage: userImage,
            videoId: data.id,
            videoThumb: data.thumbnail.hqDefault,
            videoDesc: data.description,
            videoTitle: data.title,
            like:3
        });

        //remove from local collection after selected.
        localVideoCollection.remove({_id: id});
        e.preventDefault();
    }
});

Template.Submit.helpers({
    videoItems: function() {
        return localVideoCollection.find();
    }
});

/*****************************************************************************/
/* Submit: Lifecycle Hooks */
/*****************************************************************************/
Template.Submit.created = function() {

};

Template.Submit.rendered = function() {
    init();
};

Template.Submit.destroyed = function() {
    if (localVideoCollection){
        localVideoCollection.remove({});
    }
};
localVideoCollection = new Meteor.Collection(null);
var tlSubmit;
var init = function() {


    var $input = $('#searchInput'),
        $searchVideoBtn = $('.searchVideoBtn'),
        $loader = $('#loader'),
        $results = $('#results'),
        $formAsset = $('#searchForm').children(),
        $close = $('.fa-close'),
        $thumbs = '#results .thumb',
        $submitForm = $('#submitForm'),
        videoItems = [];

    //center assets. takes care of vendor prefixes.
    TweenMax.set(".centerMe", {
        xPercent: -50,
        yPercent: -50
    });

    //define sequence.
    var tl = new TimelineLite({
            delay: 1,
            onStart: function() {
                $input.focus();
                if (localVideoCollection){
                    localVideoCollection.remove({});
                }
            }
        })
        .addPause()
        
        //display loader.
        .add(TweenMax.to($loader, .1, {display: "block"}, 0.1))
        .fromTo($loader, 0.45, 
            {ease: Elastic.easeOut.config(1, 0.6),y: 380}, 
            {y: 100}
        )
        //pause and call API.
        .addPause("+=.1", searchForVideo)
        //hide loader
        .add(TweenMax.to($loader, .5, {ease: Back.easeIn,opacity: 0,y: "-=80"}, 0.1))
        //pause and add thumbs to the dom
        .addPause("+=.2", addResultsUI)
        //display thumbnails.
        .call(displayResults);

    /*****************************************************************/
    /*************  SUBMIT TM   8*************************************/
    /*****************************************************************/
    //
    tlSubmit = new TimelineLite({
            paused: true
        })
        .add(TweenMax.to($results, .25, {
            display: 'none'
        }))
        .add(TweenMax.from($submitForm, .5, {
            ease: Back.easeOut,
            scale: 0
        }));

    //event handlers.
    $input.keyup(function(event) {
        event.preventDefault();
        if (event.keyCode == 13) {
            restartTimeline();
        }
    });


    $searchVideoBtn.on('click', function() {
        restartTimeline();
    });

    /**
     * Restarts the animation sequence which will end in a display of results. 
     * @return {[type]} [description]
     */
    function restartTimeline()
    {
        $input.blur();
        tl.restart();
    }


    //init API.
    function searchForVideo() {
        $.youtubeAPI($input.val(), onSearchForVideoResults)
    }

    //Callback. Define items and continue sequence.
    function onSearchForVideoResults(result) {
        videoItems = result.data.items;
        tl.resume();
    }

    //display loader
    function showLoader() {
        TweenMax.from($loader, 0.5, {
            ease: Elastic.easeOut.config(1, 0.6),
            y: +300,
            opacity: 0
        }, 1);
    }


    //add ui to the DOM.
    function addResultsUI() {

        if (videoItems) {
            var length = videoItems.length;
            $.each(videoItems, function(i, data) {
                localVideoCollection.insert({
                    data: data
                });
                if ((length - 1) === i) {
                    tl.play();
                }
            });
        } else {
            tl.play();
        }
    }

    //display each thumb.
    function displayResults() {
        TweenMax.staggerFromTo($thumbs, 1.5, {y: "+=20"}, {opacity: 1,y: "-=20"},.15);
    }


    /**
     * youtubeAPI
     * @param  {string}   searchTerm        user defined search terms
     * @param  {Function} cb                callback
     * @return {object}                     object holding paths to youtube assets.
     */
    $.youtubeAPI = function(searchTerm, cb) {
        $.ajax({
            type: 'GET',
            url: 'http://gdata.youtube.com/feeds/api/videos?q=' + searchTerm + '&max-results=10&v=2&alt=jsonc',
            dataType: 'jsonp',
            success: cb,
            error: function(res, statusTXT, jqXHR) {
                console.error('ERROR: ' + statusTXT);
            }
        });
    };

};

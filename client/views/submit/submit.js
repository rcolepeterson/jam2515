/*****************************************************************************/
/* Submit: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Submit.events({
    'click .thumbnail': function(e, tmpl) {

        console.log('we have a submission');
        var id = $( e.currentTarget ).data( "id");
        var obj = foos.findOne( {_id:id});
        data = obj.data;
        //debugger;
        var empty = "";
        //var link = tmpl.find('#urlinput').value;
        //var desc = tmpl.find('#descinput').value;
        var email = 'colep@zaaz.com';
        var userId = 444;
        var postAuthorImage = "http://fillmurray.com/50/50";

        submitPost = function() {

             if (!Meteor.user()) {
                Session.set('sAlert', {
                    message: 'You must be logged in to post a video',
                    position: 'left-bottom'
                });
                return;
            }

            userId = Meteor.user()._id;
            name = Meteor.user().profile.name;

            if (Meteor.user().emails) {
                email = Meteor.user().emails[0].address;
            }

            if (Meteor.user().profile && Meteor.user().profile.picture) {
                postAuthorImage = Meteor.user().profile.picture;
            }

            var VideoID = Videos.insert({
                created_at: new Date(),
                ownerId: userId,
                authorImage: postAuthorImage,
                videoId:data.id,
                //url: link,
                //name: name,
                email: email,
                //tag: tag,
                postImage: data.thumbnail.hqDefault,
                postDesc: data.description,
                postTitle:  data.title,
                like: 0,
                postviews: 0
            });

            //confirmation msg.
            Session.set('sAlert', {
                message: 'Your post has been submitted! Great post name BTW.',
                position: 'left-bottom'
            });

        };

        submitPost();
        e.preventDefault();
    }
});

Template.Submit.helpers({
    /*
     * Example:
     *  items: function () {
     *    return Items.find();
     *  }
     */
    foosItems:function(){
        return foos.find();
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

Template.Submit.destroyed = function() {};
foos = new Meteor.Collection( null );
var init = function() {

    "use strict";

    var $input = $('#searchInput'),
        $loader = $('#loader'),
        //$results = $('#results'),
        $formAsset = $('#searchForm').children(),
        $close = $('.fa-close'),
        $thumbs = '.thumb',
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
                TweenMax.set(".centerMe", {
                    display: 'block'
                })
            }
        })
        //move search label and input on the screen and pause operation.
        .add(TweenMax.staggerFrom($formAsset, 0.5, {
            opacity: 0,
            y: +100,
            ease: Back.easeIn
        }, 0.1))
        .addPause()
        //on submit ... move search label and input off the screen.
        .add(TweenMax.staggerTo($formAsset, 0.5, {
            opacity: 0,
            y: -100,
            ease: Back.easeIn
        }, 0.1))
        //display loader.
        .from($loader, 0.5, {
            ease: Elastic.easeOut.config(1, 0.6),
            y: "+=80",
            opacity: 0
        }, 1.25)
        //pause and call API.
        .addPause("+=.1", searchForVideo)
        //hide loader
        .add(TweenMax.to($loader, .5, {
            ease: Back.easeIn,
            opacity: 0,
            y: "-=80"
        }, 0.1))
        //pause and add thumbs to the dom
        .addPause("+=.2", addResultsUI)
        //display thumbnails.
        .call(displayResults)
        //show close button
        .add(TweenMax.from($close, .5, {
            ease: Back.easeIn,
            rotation: 45,
            opacity: 0,
            x: "-=60",
            delay: .75
        }));

    //event handlers.
    $input.keyup(function(event) {
        event.preventDefault();
        if (event.keyCode == 13) {
            $input.blur();
            //start timeline here!
            tl.play();
        }
    });

    $close.on('click', function() {
        //$results.empty();
        $input.val('').focus();
        tl.restart();
    });

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
        //$results.empty();
        if (videoItems) {


// for ( var i = 0; i < 100; i++ ) {
//   foos.insert({ num: i });
// }
// foos.findOne( {} ).num; // => 0
// var f = foos.findOne( {}, { sort: [[ "num", "desc" ]] } ).num; // => 99
// console.log('f',f);

            var length = videoItems.length;
            
            $.each(videoItems, function(i, data) {
                foos.insert({ data: data });
                if ((length - 1) === i) {
                    tl.play();
                }
            });
        } else {
            //$results.prepend('<div class="thumb">No videos found.</div></div>');
            tl.play();
        }
    }

    //display each thumb.
    function displayResults() {
        TweenMax.staggerTo($thumbs, 1.5, {
            opacity: 1,
            y: "+=20"
        }, .15);
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

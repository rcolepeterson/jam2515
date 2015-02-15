/*****************************************************************************/
/* Submit: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Submit.events({

    //display submit form by running GSAP timeline sequence
    'click #results .thumbnail': function(e, tmpl) {

        //get id from DOM.
        var id = $(e.currentTarget).data("id");
        //get document from Collection.
        var obj = foos.findOne({
            _id: id
        });
        var data = obj.data;
        //  debugger;
        tmpl.state.set('selId', id);
        tmpl.state.set('selThumbImg', data.thumbnail.hqDefault);
        tmpl.state.set('selTitle', data.title);
        tlSubmit.play();
    },
    //hide submit form by reversing GSAP timeline sequence
    'click .submitFormBtnCancel': function(e, tmpl) {
        tlSubmit.reverse();
    },
    //submit. insert in DB.
    'click .submitFormBtn': function(e, tmpl) {
        console.log('we have submitted');
        var id = tmpl.state.get('selId');
        var obj = foos.findOne({
            _id: id
        });
        //debugger;
        var data = obj.data;
        //debugger;
        var empty = "";
        //var link = tmpl.find('#urlinput').value;
        //var desc = tmpl.find('#descinput').value;
        var email = 'colep@zaaz.com';
        var userId = 444;
        var postAuthorImage = "http://fillmurray.com/50/50";

        submitPost = function() {

            if (!Meteor.user()) {

                sAlert.error('Boom! You must be logged in to post a video!', {
                    effect: 'genie',
                    position: 'right-bottom',
                    timeout: 'no'
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
                videoId: data.id,
                //url: link,
                //name: name,
                email: email,
                //tag: tag,
                postImage: data.thumbnail.hqDefault,
                postDesc: data.description,
                postTitle: data.title,
                like: 0,
                postviews: 0
            });

            console.log('we have submitted VideoID', VideoID);

            sAlert.success('Boom! Your post has been submitted! Great post name BTW.', {
                    effect: 'genie',
                    position: 'right-bottom',
                    timeout: 'no'
                });

            tlSubmit.reverse();

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
    foosItems: function() {
        return foos.find();
    }
});

/*****************************************************************************/
/* Submit: Lifecycle Hooks */
/*****************************************************************************/
Template.Submit.created = function() {

    //create reactive dictionay to hold sel youtube data for display and submission
    this.state = new ReactiveDict();
    this.state.set('selThumbImg', '');
    this.state.set('selTitle', '');



};

Template.Submit.helpers({
    selId: function() {
        return Template.instance().state.get('selId');
    },
    selThumbImg: function() {
        return Template.instance().state.get('selThumbImg');
    },
    selTitle: function() {
        return Template.instance().state.get('selTitle');
    }
});

Template.Submit.rendered = function() {
    init();
};

Template.Submit.destroyed = function() {};
foos = new Meteor.Collection(null);
var tlSubmit;
var init = function() {

    "use strict";

    var $input = $('#searchInput'),
        $loader = $('#loader'),
        $results = $('#results'),
        $formAsset = $('#searchForm').children(),
        $close = $('.fa-close'),
        $thumbs = '.thumb',
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

    /*****************************************************************/
    /*************  SUBMIT TM   8*************************************/
    /*****************************************************************/
    //
    tlSubmit = new TimelineLite({
            paused: true,
            onStart: function() {
                //TweenMax.set()
            }
        })
        .add(TweenMax.to($results, .25, {
            opacity: .2
        }))
        .add(TweenMax.from($submitForm, .5, {
            ease: Back.easeOut,
            scale: 0
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

            var length = videoItems.length;

            $.each(videoItems, function(i, data) {
                foos.insert({
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

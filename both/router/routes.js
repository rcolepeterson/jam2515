/*****************************************************************************/
/* Client and Server Routes */
/*****************************************************************************/
Router.configure({
    layoutTemplate: 'MasterLayout',
    loadingTemplate: 'Loading',
    notFoundTemplate: 'NotFound'
});

/*
 *  Example:
 *  Router.route('/', {name: 'home'});
 */
Router.route('/', {
    name: 'home'
});
Router.route('/submit', {
    name: 'submit'
});
Router.route('/videos', {
    name: 'videos'
});

Router.route('/videodetail/:_id', {
    name: 'videodetail',
    //template: 'PostIndex',
    waitOn: function() {
        //return [Meteor.subscribe('videos')];
    },
    data: function() {
        return Videos.findOne({
            _id: Router.current().params._id
        });
    },
    action: function() {
        Videos.update({
            _id: Router.current().params._id
        }, {
            $inc: {
                postviews: 1
            }
        });

        this.render('Videodetail');

    }
});


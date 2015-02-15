/*****************************************************************************/
/* Home: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Home.events({
  /*
   * Example:
   *  'click .selector': function (e, tmpl) {
   *
   *  }
   */
  
  'click #removeall': function(e, tmpl) {
        Meteor.call('removeAllVideos');
        e.preventDefault();
    },
});

Template.Home.helpers({
  /*
   * Example:
   *  items: function () {
   *    return Items.find();
   *  }
   */
});

/*****************************************************************************/
/* Home: Lifecycle Hooks */
/*****************************************************************************/
Template.Home.created = function () {
};

Template.Home.rendered = function () {
  //confirmation msg.
    // Session.set('sAlert', {
    //     message: 'Lets do it!',
    //     position: 'left-bottom'
    // });

    console.log("we have home", Session.get('sAlert'));

    sAlert.error('Boom! Something went wrong!', {effect: 'genie', position: 'right-bottom', timeout: 'no'});
};

Template.Home.destroyed = function () {
};



/*****************************************************************************/
/* MasterLayout: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.MasterLayout.events({
  /*
   * Example:
   *  'click .selector': function (e, tmpl) {
   *
   *  }
   */
});

Template.MasterLayout.helpers({
  /*
   * Example:
   *  items: function () {
   *    return Items.find();
   *  }
   */
});



/*****************************************************************************/
/* MasterLayout: Lifecycle Hooks */
/*****************************************************************************/
Template.MasterLayout.created = function () {
};

Template.MasterLayout.rendered = function () {

  $('.nav a').on('click', function () {

           // if ($(".btn-navbar").is(":visible") ){ $(".btn-navbar").trigger("click"); } //bootstrap 2.x
            if ($(".navbar-toggle").is(":visible")) { $(".navbar-toggle").trigger("click"); } //bootstrap 3.x
        });

};

Template.MasterLayout.destroyed = function () {
};
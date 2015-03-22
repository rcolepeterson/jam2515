//
/*****************************************************************************/
/* Submit: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.message.events({
    'submit form': function(e, tmpl) {
        
        event.preventDefault();

        var empty = "";
        var email = 'colep@zaaz.com';
        var userId = 444;
        var postAuthorImage = "http://fillmurray.com/50/50";
        var name = "";
        var msg = ""

        submitPost = function() {
            if (!Meteor.user()) {
                sAlert.error('Hey! You must be logged in to post a message!', {
                    effect: 'genie',
                    position: 'right-bottom',
                    timeout: 3000
                });
                return;
            }

            userId = Meteor.user()._id;
            name = Meteor.user().profile.name;

            if (Meteor.user().emails) {
                email = Meteor.user().emails[0].address;
            }

            if (name = "") {
                name = email
            }

            if (Meteor.user().profile && Meteor.user().profile.picture) {
                postAuthorImage = Meteor.user().profile.picture;
            }
            msg = $('#messageInput').val();

            if (!msg)
                return;

            var messageID = Messages.insert({
                created_at: new Date(),
                ownerId: userId,
                authorImage: postAuthorImage,
                //name: name,
                email: email,
                message:msg
            });

            //remove older posts
            if (Messages.find({}).count() > 5) {
                var id = Messages.findOne({}, {
                    sort: {
                        created_at: 1
                    }
                })._id;
                Messages.remove(id);
            }

           document.getElementById('messageInput').value="";

        };

        submitPost();
        e.preventDefault();
    }
});





Template.message.helpers({

    messages: function() {
        return Messages.find({}, {
            sort: {
                created_at: -1
            }
        });
    }

});
/*****************************************************************************/
/* Message: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.message.events({
    'submit form': function(e, tmpl) {

        e.preventDefault();

        if (!Meteor.user()) {
            sAlert.error('Hey! You must be logged in to post a message!', {
                effect: 'genie',
                position: 'right-bottom',
                timeout: 3000
            });
            return;
        }

        var userId = Meteor.user()._id;
        var authorName = Meteor.user().username || Meteor.user().profile.name || "anon";
        var authorImage = Meteor.user().profile.picture;
        var msg = $('#messageInput').val();
        if (!msg){
            return;
        }

        Messages.insert({
            created_at: new Date(),
            ownerId: userId,
            authorImage: authorImage,
            authorName: authorName,
            message: msg
        });

        //remove older posts. limit to 5.
        if (Messages.find({}).count() > 5) {
            var id = Messages.findOne({}, {
                sort: {
                    created_at: 1
                }
            })._id;
            Messages.remove(id);
        }
        
        $('#messageInput').val("");
    }
});

Template.message.helpers({
    messages: function() {
        return Messages.find({}, {
            sort: {
                created_at: -1
            }
        });
    },
    hasMessages:function(){
        var val = false
        if ( Messages.find({}).count() > 0)
            val = true;

        return val;
    }
});

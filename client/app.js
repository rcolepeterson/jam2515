/*****************************************************************************/
/* Client App Namespace  */
/*****************************************************************************/
_.extend(App, {
});

App.helpers = {
};

/////////////////////////////////////
///	Global Helper functions.
////////////////////////////////////



/**
 * Change the owner of the room
 * @return {[type]} [description]
 */
App.helpers.changeRoomOwner = function ()
{
    var newOwner = Meteor.users.findOne({"status.online": true}, {sort: {createdAt: -1}});
    var roomId = Rooms.findOne({})._id;
    var newOwnerId = "";
    
    if (newOwner) {
        newOwnerId = newOwner._id;
    }
    //var update = Rooms.update({_id: roomId}, {$set: {ownerId: newOwnerId}});
    Meteor.call('updateRoomOwner', newOwnerId, function (error, result) {
        if (error){
            console.error(error);
        }
    });
}

/**
 * Display alert. Wraps sAlert API.
 * @param  {[type]} str [description]
 * @param  {[type]} val [description]
 * @return {[type]}     [description]
 */
App.helpers.displayAlert = function(str,val)
{
    sAlert.closeAll();
    sAlert.error(str, {
        effect: 'genie',
        position: 'right-bottom',
        timeout: 5000
    });
}

App.helpers.displayAlertInfo = function(str,val)
{

    sAlert.info(str, {
        effect: 'stackslide',
        position: 'right-bottom',
        timeout: 'no'
    });
}

App.helpers.setRoomAlert = function(str)
{
    Meteor.call('setRoomAlert', str, function (error, result) {
        //console.log('err0r',error,'result',result);
    });
}

App.helpers.setRoomAlertInfo = function(str)
{
    Meteor.call('setRoomAlertInfo', str, function (error, result) {
       // console.log('error: ',error,'result:',result);
    });
}


App.helpers.createRoom = function() {

    Rooms.insert({
        created_at: new Date(),
        playerCurrentTime: 0,
        ownerId: Meteor.user()._id,
        roomname: 'That is my jam',
        videoId: 'CvgqWO_TgP0',
        ownerHasNavigatedAway: false,
        like: 3
    });
}

App.helpers.getUserName = function() {

     var username = Meteor.user().username;
	 if (!username) {
	     username = Meteor.user().profile.name;
	 }

	 if (!username){
	     username = "Someone";
	 }

	 return username;
}


_.each(App.helpers, function (helper, key) {
	//console.log('app helper',key);
  Handlebars.registerHelper(key, helper);
});
/**
 * Global var for the user's id.
 * @return {[type]} [description]
 */
(function() {
    CurrentUserId = null;
    Meteor.publish(null, function() {
        CurrentUserId = this.userId;
    });
})();


/*****************************************************************************/
/* User Publish Functions
/*****************************************************************************/
Meteor.publish("userStatus", function() {
  return Meteor.users.find({ "status.online": true });
});


/*****************************************************************************/
/* Videos Publish Functions
/*****************************************************************************/

Meteor.publish('videos', function () {
  return Videos.find();
});



/*
 *  
 *  Videos - allow / deny
 * 
 */
Videos.allow({
  insert: function (userId, doc) {
    return true;
  },

  update: function (userId, doc, fieldNames, modifier) {
    return true;
  }

  // remove: function (userId, doc) {
  //   return true;
  // }
});

// Videos.deny({
//   insert: function (userId, doc) {
//     return false;
//   },

//   update: function (userId, doc, fieldNames, modifier) {
//     return false;
//   },

//   remove: function (userId, doc) {
//     return false;
//   }
// });


/*****************************************************************************/
/* MyroomsIndex Publish Functions
/*****************************************************************************/

Meteor.publish('rooms', function () {
	return Rooms.find();
});

// /*
//  *  
//  *  Room - allow / deny
//  * 
//  */
Rooms.allow({
  // insert: function (userId, doc) {
  //   return true;
  // },

  // // update: function (userId, doc, fieldNames, modifier) {
    
  // //   //console.log(' we are trying to update: ' + userId + " fieldNames " + fieldNames);
  // //   //console.log(fieldNames);
  // //   //return _.contains(fieldNames,'like') || _.contains(fieldNames,'alert');
  // //   return true;

  // // },

  // remove: function (userId, doc) {
  //   return true;
  // }
});

// Rooms.deny({
//   insert: function (userId, doc) {
//     return false;
//   },

//   update: function (userId, doc, fieldNames, modifier) {
//     return false;
//   },

//   remove: function (userId, doc) {
//     return false;
//   }
// });


/*****************************************************************************/
/* Messages Publish Functions
/*****************************************************************************/
Meteor.publish('messages', function () {
  return Messages.find();
});

/*
 *  
 *  Room - allow / deny
 * 
 */
Messages.allow({
  insert: function (userId, doc) {
    return true;
  },

  update: function (userId, doc, fieldNames, modifier) {
    return true;
  },

  remove: function (userId, doc) {
    return true;
  }
});

// Messages.deny({
//   insert: function (userId, doc) {
//     return false;
//   },

//   update: function (userId, doc, fieldNames, modifier) {
//     return false;
//   },

//   remove: function (userId, doc) {
//     return false;
//   }
// });
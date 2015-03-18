(function() {
    CurrentUserId = null;
    console.log("get the user id");
    Meteor.publish(null, function() {
    	//console.log("get the user id" + this.userId);
        CurrentUserId = this.userId;
    });

})();

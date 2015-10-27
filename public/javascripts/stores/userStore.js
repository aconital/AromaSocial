var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AppConstants = require('../dispatcher/appConstants');
var _ = require('underscore');

// Define initial data points
var _user = {}, _selected = null;

// Method to load product data from mock API
function loadUserData(data) {
  _user = data[0];
  _selected = data[0].variants[0];
}

// Method to set the currently selected product variation
function setSelected(index) {
  _selected = _user.variants[index];
}


// Extend UserStore with EventEmitter to add eventing capabilities
var UserStore = _.extend({}, EventEmitter.prototype, {

  // Return User data
  getUser: function() {
    return _user;
  },

  // Return selected User
  getSelected: function(){
    return _selected;
  },

  // Emit Change event
  emitChange: function() {
    this.emit('change');
  },

  // Add change listener
  addChangeListener: function(callback) {
    this.on('change', callback);
  },

  // Remove change listener
  removeChangeListener: function(callback) {
    this.removeListener('change', callback);
  }

});

// Register callback with AppDispatcher
AppDispatcher.register(function(payload) {
  var action = payload.action;
  var text;

  switch(action.actionType) {

    // Respond to RECEIVE_DATA action
    case AppConstants.RECEIVE_DATA:
      loadUserData(action.data);
      break;

    case AppConstants.USER_SIGNUP:
      // TODO: Respond to USER_SIGNUP action
      break;

    case AppConstants.USER_SIGNIN:
      // TODO: Respond to USER_SIGNIN action
      break;

    case AppConstants.USER_SIGNOUT: 
      // TODO: Respond to USER_SIGNOUT action
      break;

    case AppConstants.USER_EDIT_SETTINGS: 
      // TODO: Respond to USER_EDIT_SETTINGS action
      break;

    default:
      return true;
  }

  // If action was responded to, emit change event
  UserStore.emitChange();

  return true;

});

module.exports = UserStore;
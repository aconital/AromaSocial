var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AppConstants = require('../dispatcher/appConstants');
var _ = require('underscore');

// Define initial data points
var _profile = {}, _selected = null;

// Method to load product data from mock API
function loadProfileData(data) {
  _profile = data[0];
  _selected = data[0].variants[0];
}

// Method to set the currently selected product variation
function setSelected(index) {
  _selected = _profile.variants[index];
}


// Extend ProfileStore with EventEmitter to add eventing capabilities
var ProfileStore = _.extend({}, EventEmitter.prototype, {

  // Return Profile data
  getProfile: function() {
    return _profile;
  },

  // Return selected Profile
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
      loadProfileData(action.data);
      break;

    case AppConstants.PROFILE_FRIEND_ADD:
      // TODO: Respond to PROFILE_FRIEND_ADD action
      break;

    case AppConstants.PROFILE_FRIEND_REMOVE:
      // TODO: Respond to PROFILE_FRIEND_REMOVE action
      break;

    case AppConstants.PROFILE_MODEL_ADD:
      // TODO: Respond to PROFILE_MODEL_ADD action
      break;

    case AppConstants.PROFILE_MODEL_EDIT:
      // TODO: Respond to PROFILE_MODEL_EDIT action
      break;

    case AppConstants.PROFILE_MODEL_REMOVE: 
      // TODO: Respond to PROFILE_MODEL_REMOVE action
      break;

    case AppConstants.PROFILE_DATA_ADD:
      // TODO: Respond to PROFILE_DATA_ADD action
      break;

    case AppConstants.PROFILE_DATA_EDIT:
      // TODO: Respond to PROFILE_DATA_EDIT action
      break;

    case AppConstants.PROFILE_DATA_REMOVE: 
      // TODO: Respond to PROFILE_DATA_REMOVE action
      break;

// RESUME-RELATED ACTIONS

    case AppConstants.RESUME_SUMMARY_EDIT:
      // TODO: Respond to RESUME_SUMMARY_EDIT action
      break;

    case AppConstants.RESUME_EDUCATION_ADD:
      // TODO: Respond to RESUME_EDUCATION_ADD action
      break;

    case AppConstants.RESUME_EDUCATION_EDIT:
      // TODO: Respond to RESUME_EDUCATION_EDIT action
      break;

    case AppConstants.RESUME_EDUCATION_REMOVE: 
      // TODO: Respond to RESUME_EDUCATION_REMOVE action
      break;

    case AppConstants.RESUME_EXPERIENCE_ADD:
      // TODO: Respond to RESUME_EXPERIENCE_ADD action
      break;

    case AppConstants.RESUME_EXPERIENCE_EDIT:
      // TODO: Respond to RESUME_EXPERIENCE_EDIT action
      break;

    case AppConstants.RESUME_EXPERIENCE_REMOVE: 
      // TODO: Respond to RESUME_EXPERIENCE_REMOVE action
      break;

    default:
      return true;
  }

  // If action was responded to, emit change event
  ProfileStore.emitChange();

  return true;

});

module.exports = ProfileStore;
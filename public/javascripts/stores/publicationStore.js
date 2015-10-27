var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AppConstants = require('../dispatcher/appConstants');
var _ = require('underscore');

// Define initial data points
var _publication = {}, _selected = null;

// Method to load product data from mock API
function loadPublicationData(data) {
  _publication = data[0];
  _selected = data[0].variants[0];
}

// Method to set the currently selected product variation
function setSelected(index) {
  _selected = _publication.variants[index];
}


// Extend PublicationStore with EventEmitter to add eventing capabilities
var PublicationStore = _.extend({}, EventEmitter.prototype, {

  // Return Publication data
  getPublication: function() {
    return _publication;
  },

  // Return selected Publication
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
      loadPublicationData(action.data);
      break;

    case AppConstants.PUBLICATION_ADD:
      // TODO: Respond to PUBLICATION_ADD action
      break;

    case AppConstants.PUBLICATION_EDIT:
      // TODO: Respond to PUBLICATION_EDIT action
      break;

    case AppConstants.PUBLICATION_REMOVE: 
      // TODO: Respond to PUBLICATION_REMOVE action
      break;

    default:
      return true;
  }

  // If action was responded to, emit change event
  PublicationStore.emitChange();

  return true;

});

module.exports = PublicationStore;
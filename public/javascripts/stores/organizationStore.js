var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AppConstants = require('../dispatcher/appConstants');
var _ = require('underscore');

// Define initial data points
var _organization = {}, _selected = null;

// Method to load product data from mock API
function loadOrganizationData(data) {
  _organization = data[0];
  _selected = data[0].variants[0];
}

// Method to set the currently selected product variation
function setSelected(index) {
  _selected = _organization.variants[index];
}


// Extend OrganizationStore with EventEmitter to add eventing capabilities
var OrganizationStore = _.extend({}, EventEmitter.prototype, {

  // Return Organization data
  getOrganization: function() {
    return _organization;
  },

  // Return selected Organization
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
      loadOrganizationData(action.data);
      break;

    case AppConstants.ORGANIZATION_ADMIN_EDIT:
      // TODO: Respond to ORGANIZATION_CONNECTION_ADD action
      break;

    case AppConstants.ORGANIZATION_CONNECTION_ADD:
      // TODO: Respond to ORGANIZATION_CONNECTION_ADD action
      break;

    case AppConstants.ORGANIZATION_CONNECTION_EDIT:
      // TODO: Respond to ORGANIZATION_CONNECTION_EDIT action
      break;

    case AppConstants.ORGANIZATION_CONNECTION_REMOVE: 
      // TODO: Respond to ORGANIZATION_CONNECTION_REMOVE action
      break;

    default:
      return true;
  }

  // If action was responded to, emit change event
  OrganizationStore.emitChange();

  return true;

});

module.exports = OrganizationStore;
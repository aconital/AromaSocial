var AppDispatcher = require('../dispatcher/AppDispatcher');
var AppConstants = require('../dispatcher/appConstants');

// Define actions object
var AppActions = {

  // Receive inital product data
  receiveProduct: function(data) {
    AppDispatcher.handleAction({
      actionType: AppConstants.RECEIVE_DATA,
      data: data
    })
  },

  // Set currently selected product variation
  selectProduct: function(index) {
    AppDispatcher.handleAction({
      actionType: AppConstants.SELECT_PRODUCT,
      data: index
    })
  },

  // Add item to cart
  addToCart: function(sku, update) {
    AppDispatcher.handleAction({
      actionType: AppConstants.CART_ADD,
      sku: sku,
      update: update
    })
  },

  // Remove item from cart
  removeFromCart: function(sku) {
    AppDispatcher.handleAction({
      actionType: AppConstants.CART_REMOVE,
      sku: sku
    })
  },

  // Update cart visibility status
  updateCartVisible: function(cartVisible) {
    AppDispatcher.handleAction({
      actionType: AppConstants.CART_VISIBLE,
      cartVisible: cartVisible
    })
  }

};

module.exports = AppActions;
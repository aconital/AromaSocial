var keyMirror = require('react/lib/keyMirror');

// Define action constants
module.exports = keyMirror({
  // active user action constants
  USER_SIGNUP: null,
  USER_SIGNIN: null,
  USER_SIGNOUT: null,
  USER_EDIT_SETTINGS: null,
  // publication action constants
  PUBLICATION_ADD: null,
  PUBLICATION_EDIT: null,
  PUBLICATION_REMOVE: null,
  // organization action constants
  ORGANIZATION_ADMIN_EDIT: null,
  ORGANIZATION_CONNECTION_ADD: null,
  ORGANIZATION_CONNECTION_EDIT: null,
  ORGANIZATION_CONNECTION_REMOVE: null,
  // profile action constants
  PROFILE_FRIEND_ADD: null,
  PROFILE_FRIEND_REMOVE: null,
  PROFILE_MODEL_ADD: null,
  PROFILE_MODEL_EDIT: null,
  PROFILE_MODEL_REMOVE: null,
  PROFILE_DATA_ADD: null,
  PROFILE_DATA_EDIT: null,
  PROFILE_DATA_REMOVE: null,
  // resume action constants (under profile)
  RESUME_SUMMARY_EDIT: null,
  RESUME_EDUCATION_ADD: null,
  RESUME_EDUCATION_EDIT: null,
  RESUME_EDUCATION_REMOVE: null,
  RESUME_EXPERIENCE_ADD: null,
  RESUME_EXPERIENCE_EDIT: null,
  RESUME_EXPERIENCE_REMOVE: null
  // TODO: add data/model actions
});
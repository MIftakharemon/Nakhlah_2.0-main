/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string|null} name - User name
 * @property {string} role - User role
 */

/**
 * @typedef {Object} AuthSession
 * @property {User} user - User object
 * @property {string} accessToken - JWT access token from backend API
 * @property {string} expires - Session expiration date
 * @property {string} [error] - Error message if session is invalid
 */

/**
 * @typedef {Object} RegistrationResponse
 * @property {boolean} success - Whether registration was successful
 * @property {string} [token] - JWT token from backend
 * @property {Object} [user] - User object from backend
 * @property {number} [exp] - Token expiration timestamp
 * @property {string} [message] - Success message
 * @property {string} [error] - Error message if registration failed
 */

/**
 * @typedef {Object} LoginResponse
 * @property {boolean} ok - Whether login was successful
 * @property {string} [error] - Error message if login failed
 * @property {number} [status] - HTTP status code
 */

export { };

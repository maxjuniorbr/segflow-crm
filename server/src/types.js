// @ts-check

/**
 * @typedef {Object} ClientAddress
 * @property {string} street
 * @property {string} number
 * @property {string} [complement]
 * @property {string} neighborhood
 * @property {string} city
 * @property {string} state
 * @property {string} zipCode
 */

/**
 * @typedef {Object} ClientPayload
 * @property {string} [id]
 * @property {string} [brokerId]
 * @property {string} name
 * @property {'Física'|'Jurídica'} [personType]
 * @property {string|null} [cpf]
 * @property {string|null} [cnpj]
 * @property {string|null} [rg]
 * @property {string|null} [rgDispatchDate]
 * @property {string|null} [rgIssuer]
 * @property {string|null} [birthDate]
 * @property {string|null} [maritalStatus]
 * @property {string|null} [email]
 * @property {string|null} [phone]
 * @property {ClientAddress|null} [address]
 * @property {string|null} [notes]
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} DocumentPayload
 * @property {string} [id]
 * @property {string} [brokerId]
 * @property {string} clientId
 * @property {string} type
 * @property {string} company
 * @property {string|null} [documentNumber]
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} status
 * @property {string|null} [attachmentName]
 * @property {string|null} [notes]
 */

/**
 * @typedef {Object} BrokerPayload
 * @property {string} [id]
 * @property {string} corporateName
 * @property {string} tradeName
 * @property {string} cnpj
 * @property {string|null} [susepCode]
 * @property {string} contactName
 * @property {string} email
 * @property {string} phone
 * @property {string} mobile
 */

/**
 * @typedef {Object} UserPayload
 * @property {string} name
 * @property {string} [brokerId]
 * @property {string} cpf
 * @property {string} email
 * @property {string} [password]
 */

/**
 * @typedef {Object} AuthRegisterPayload
 * @property {string} name
 * @property {string} cpf
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} AuthLoginPayload
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} PasswordChangePayload
 * @property {string} currentPassword
 * @property {string} newPassword
 */

/**
 * @typedef {Object} PasswordChangeRequest
 * @property {string|number|null} authenticatedUserId
 * @property {string|null} [authenticatedBrokerId]
 * @property {string|number} requestedUserId
 * @property {string} currentPassword
 * @property {string} newPassword
 */

/**
 * @typedef {Object} UseCaseResult
 * @property {number} status
 * @property {any} payload
 */

/**
 * @typedef {Object} RegisterBrokerPayload
 * @property {string} corporateName
 * @property {string} tradeName
 * @property {string} cnpj
 * @property {string|null} [susepCode]
 * @property {string|null} [phone]
 * @property {string|null} [mobile]
 * @property {string} email
 * @property {string} contactName
 * @property {string} cpf
 * @property {string} password
 */


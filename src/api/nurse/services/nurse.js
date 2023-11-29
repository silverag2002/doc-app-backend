'use strict';

/**
 * nurse service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::nurse.nurse');

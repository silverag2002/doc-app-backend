"use strict";

/**
 * hospital controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::hospital.hospital",
  ({ strapi }) => ({
    async find(ctx) {
      let entities;
      console.log("CTX>STASTE", ctx.state);

      return "ANKIT";
    },

    async findOne(ctx) {
      const { id } = ctx.params;
      const entity = await strapi.services.hospital.findOne({
        id,
        "organisation.id": ctx.state.user.organisation,
      });
      return strapi.services.hospital.sanitize(entity);
    },
  })
);

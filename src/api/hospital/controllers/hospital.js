"use strict";
const bcrypt = require("bcryptjs");
const { USER_CODE } = require("../../../utils/constants");

/**
 * hospital controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::hospital.hospital",
  ({ strapi }) => ({
    async create(ctx) {
      if (
        ctx.state.route.method == "POST" &&
        ctx.state.user.user_type < USER_CODE.HOSPITAL
      ) {
        const { name, email, contact_number, password, address } =
          ctx.request.body;

        const hashPassword = (password) => bcrypt.hash(password, 10);
        try {
          const loginInfo = await strapi
            .query("plugin::users-permissions.user")
            .create({
              data: {
                username: name,
                email,
                password: await hashPassword(password),
                confirmed: true,
                user_type: USER_CODE.HOSPITAL,
                role: 4,
              },
            });
          console.log("ORG HI", ctx.state);
          const orgInfo = await strapi.db
            .query("api::organisation.organisation")
            .findOne({ where: { email: ctx.state.user.email } });
          console.log("ORg Info", orgInfo);
          if (!orgInfo) {
            ctx.badRequest("Organsation not found");
          }
          const hostpitalCreation = await strapi.entityService.create(
            "api::hospital.hospital",
            {
              data: {
                name,
                contact_number,
                address,
                organisation: orgInfo.id,
                email,
              },
            }
          );
          ctx.send({ message: "Hospital Created" });
        } catch (err) {
          console.log(err);
          ctx.internalServerError(
            "Something went wrong please try again later"
          );
        }
      } else {
        ctx.unauthorized("You are Unauthorised to perform this action");
      }
    },
  })
);

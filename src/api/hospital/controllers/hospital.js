"use strict";
const bcrypt = require("bcryptjs");
const USER_CODE = Object.freeze({
  SUPER_ADMIN: 0,
  ORGANISATION: 1,
  HOSPITAL: 2,
  CLINICS: 3,
  DOCTOR: 4,
  NURSE: 5,
  STAFF: 6,
});

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
          //   const orgInfo = await strapi.db
          //     .query("api::organisation.organisation")
          //     .findOne({ where: { email: ctx.state.user.email } });
          //   console.log("ORg Info", orgInfo);

          let orgInfo;
          if (ctx.state.user.user_type == USER_CODE.ORGANISATION) {
            //from token we know its org so getting org id from org table
            orgInfo = await strapi.db
              .query("api::organisation.organisation")
              .findOne({ where: { email: ctx.state.user.email } });
            console.log("ORg Info", orgInfo);
          } else {
            //super admin or higher authority directly trying to create hospital so orgId is expected
            orgInfo = ctx.request.body.orgId;
            if (!orgInfo) {
              ctx.badRequest("Org Id not provided");
            }
          }
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

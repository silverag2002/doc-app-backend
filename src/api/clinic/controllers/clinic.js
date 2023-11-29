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
 * clinic controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::clinic.clinic", ({ strapi }) => ({
  async create(ctx) {
    if (
      ctx.state.route.method == "POST" &&
      ctx.state.user.user_type < USER_CODE.CLINICS
    ) {
      const { name, email, contact_number, password, address } =
        ctx.request.body;

      // Get the default role
      const role = await strapi
        .query("plugin::users-permissions.role")
        .findMany();
      console.log("REOLE", role);

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
              user_type: USER_CODE.CLINICS,
              role: 5,
            },
          });
        console.log("ORG HI", ctx.state);

        let orgInfo;
        if (ctx.state.user.user_type == USER_CODE.HOSPITAL) {
          //from token we know its hospital so getting hospital id from hospital table
          orgInfo = await strapi.db
            .query("api::hospital.hospital")
            .findOne({ where: { email: ctx.state.user.email } });
          console.log("ORg Info", orgInfo);
        } else {
          //super admin or hospital or org directly trying to create hospital so hospitalId is expected
          orgInfo = ctx.request.body.hospitalId;
          if (!orgInfo) {
            ctx.badRequest("Hospital Id not provided");
          }
        }
        console.log("ORg Info", orgInfo);
        if (!orgInfo) {
          ctx.badRequest("Organsation not found");
        }
        const clinicCreation = await strapi.entityService.create(
          "api::clinic.clinic",
          {
            data: {
              name,
              contact_number,
              address,
              hospital: orgInfo.id,
              email,
            },
          }
        );
        ctx.send({ message: "Clinic Created" });
      } catch (err) {
        console.log(err);
        ctx.internalServerError("Something went wrong please try again later");
      }
    } else {
      ctx.unauthorized("You are Unauthorised to perform this action");
    }
  },
}));

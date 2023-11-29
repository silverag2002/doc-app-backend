"use strict";

/**
 * staff controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

("use strict");
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

module.exports = createCoreController("api::staff.staff", ({ strapi }) => ({
  async create(ctx) {
    if (
      ctx.state.route.method == "POST" &&
      ctx.state.user.user_type < USER_CODE.STAFF &&
      ![USER_CODE.DOCTOR, USER_CODE.NURSE].includes(ctx.state.user_type)
    ) {
      const { name, email, contact_number, password } = ctx.request.body;

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
              user_type: USER_CODE.STAFF,
              role: 7,
            },
          });
        console.log("ORG HI", ctx.state);
        let orgInfo;
        if (ctx.state.user.user_type == USER_CODE.CLINICS) {
          //from token we know its clinics so getting clinics id from clinics table
          orgInfo = await strapi.db
            .query("api::clinic.clinic")
            .findOne({ where: { email: ctx.state.user.email } });
        } else {
          //super admin or organisation or hospital directly trying to create doctor so clinicId is expected
          orgInfo = ctx.request.body.clinicId;
          if (!orgInfo) {
            ctx.badRequest("Clinic Id not provided");
          }
        }
        if (!orgInfo) {
          ctx.badRequest("Clinic not found");
        }
        const staffCreation = await strapi.entityService.create(
          "api::staff.staff",
          {
            data: {
              name,
              contact_number,

              clinic: orgInfo.id,
              email,
            },
          }
        );
        ctx.send({ message: "Staff Created" });
      } catch (err) {
        console.log(err);
        ctx.internalServerError("Something went wrong please try again later");
      }
    } else {
      ctx.unauthorized("You are Unauthorised to perform this action");
    }
  },
}));

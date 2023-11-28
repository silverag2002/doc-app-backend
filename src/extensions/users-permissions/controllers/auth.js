require("@strapi/strapi");

async function login(ctx) {
  const { email, password } = ctx.request.body;
  console.log("PROVIDED EMIAL AND PASSWORD", email, password);
  // Check if email and password is provided
  if (!password || !email) {
    return ctx.badRequest("Email or password is not provided");
  }

  // Check if a user is registered with this phone number
  let user = await strapi.query("plugin::users-permissions.user").findOne({
    where: {
      email,
    },
  });
  console.log("USER FOUND IN DB", user);

  if (!user) {
    ctx.badRequest("User not Found");
  }

  const token = await strapi.plugin("users-permissions").service("jwt").issue({
    id: "ankit",
  });

  return ctx.send({
    jwt: token,
    user: user,
  });
}

// async function verify(ctx) {
//   const { phone_number, otp } = ctx.request.body;

//   // Check if a user is registered with this phone number
//   let user = await strapi.query("plugin::users-permissions.user").findOne({
//     where: {
//       phone_number,
//     },
//   });
//   if (!user) {
//     return ctx.badRequest("User not found");
//   }

//   // Check if the user otp is expired or sent
//   if (!user.otp || user.otp === "") {
//     return ctx.badRequest("OTP not sent");
//   }

//   // Match the OTP sent with the one in the database
//   if (user.otp !== otp) {
//     return ctx.badRequest("OTP does not match");
//   }

//   // Unblock a user if they have been blocked having no name or email and remove the OTP
//   if (user.blocked) {
//     await strapi.query("plugin::users-permissions.user").update({
//       where: { id: user.id },
//       data: {
//         blocked: false,
//         confirmed: true,
//         otp: "",
//       },
//     });
//   }

//   // Generate JWT Token
//   const token = strapi.plugin("users-permissions").service("jwt").issue({
//     id: user.id,
//   });

//   return ctx.send({
//     jwt: token,
//     user: user,
//   });
// }

// async function update(ctx) {
//   const { id } = ctx.state.user;
//   const data = ctx.request.body;

//   await strapi.entityService.update("plugin::users-permissions.user", id, {
//     data,
//   });

//   const user = await strapi.entityService.findOne(
//     "plugin::users-permissions.user",
//     id,
//     {
//       populate: "*",
//     }
//   );

//   return ctx.send(user);
// }

module.exports = {
  //   verify,
  //   smsCallback,
  //   update,
  login,
};

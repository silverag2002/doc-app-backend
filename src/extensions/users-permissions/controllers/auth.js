require("@strapi/strapi");
const bcrypt = require("bcryptjs");

async function login(ctx) {
  console.log("CTX. state", ctx.state);
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

  if (await bcrypt.compare(password, user.password)) {
    const token = await strapi
      .plugin("users-permissions")
      .service("jwt")
      .issue({
        id: user.id,
      });
    return ctx.send({
      jwt: token,
      user: user,
    });
  } else {
    return ctx.badRequest("Unauthorized");
  }
}

module.exports = {
  login,
};

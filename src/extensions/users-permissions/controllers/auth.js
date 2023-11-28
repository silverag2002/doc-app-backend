require("@strapi/strapi");

async function smsCallback(ctx) {
  const { phone_number } = ctx.request.body;

  // Check if the phone number is valid
  if (phone_number.length < 10 || phone_number.length > 15) {
    return ctx.badRequest("Invalid phone number");
  }

  // Generate the user otp

  // Check if a user is registered with this phone number
  let user = await strapi.query("plugin::users-permissions.user").findOne({
    where: {
      phone_number,
    },
  });

  if (!user) {
    // Get the Strapi Settings
    const pluginStore = await strapi.store({
      type: "plugin",
      name: "users-permissions",
    });

    const settings = await pluginStore.get({
      key: "advanced",
    });

    // Get the default role

    // Create a new user
    user = await strapi.query("plugin::users-permissions.user").create({
      data: {
        phone_number,

        blocked: true,
      },
    });
  } else {
    // Update the user otp
  }

  return ctx.send({
    message: "OTP sent",
    destination: phone_number,
  });
}

async function verify(ctx) {
  const { phone_number, otp } = ctx.request.body;

  // Check if a user is registered with this phone number
  let user = await strapi.query("plugin::users-permissions.user").findOne({
    where: {
      phone_number,
    },
  });
  if (!user) {
    return ctx.badRequest("User not found");
  }

  // Check if the user otp is expired or sent
  if (!user.otp || user.otp === "") {
    return ctx.badRequest("OTP not sent");
  }

  // Match the OTP sent with the one in the database
  if (user.otp !== otp) {
    return ctx.badRequest("OTP does not match");
  }

  // Unblock a user if they have been blocked having no name or email and remove the OTP
  if (user.blocked) {
    await strapi.query("plugin::users-permissions.user").update({
      where: { id: user.id },
      data: {
        blocked: false,
        confirmed: true,
        otp: "",
      },
    });
  }

  // Generate JWT Token
  const token = strapi.plugin("users-permissions").service("jwt").issue({
    id: user.id,
  });

  return ctx.send({
    jwt: token,
    user: user,
  });
}

async function update(ctx) {
  const { id } = ctx.state.user;
  const data = ctx.request.body;

  await strapi.entityService.update("plugin::users-permissions.user", id, {
    data,
  });

  const user = await strapi.entityService.findOne(
    "plugin::users-permissions.user",
    id,
    {
      populate: "*",
    }
  );

  return ctx.send(user);
}

module.exports = {
  verify,
  smsCallback,
  update,
};

module.exports = [
  {
    method: "POST",
    path: "/auth/login",
    handler: "auth.login",
    config: {
      prefix: "",
      auth: false,
    },
  },
  {
    method: "POST",
    path: "/auth/signin",
    handler: "auth.signin",
    config: {
      prefix: "",
      auth: false,
    },
  },
];

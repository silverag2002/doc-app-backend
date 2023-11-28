module.exports = [
  {
    method: "POST",
    path: "/auth/sms/verify",
    handler: "auth.verify",
    config: {
      prefix: "",
    },
  },
];

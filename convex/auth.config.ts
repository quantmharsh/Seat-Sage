
// connecting our convex backend with Clerk   using  JWTTemplates(inside clerk)
//it helps to get loged in user data to our  convex backend
export default {
    providers: [
      {
        domain: "https://pro-mantis-30.clerk.accounts.dev",
        applicationID: "convex",
      },
    ]
  };
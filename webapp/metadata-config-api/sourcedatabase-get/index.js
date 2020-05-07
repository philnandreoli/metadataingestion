//Application Insights Setup
const appInsights = require("applicationinsights");
appInsights.setup();
const client = appInsights.defaultClient;

module.exports = async function (context, req, configs) {
  try {
    context.res.status(200).json(configs);
  } catch (error) {
    context.res = {
      status: 500,
      body: error,
      headers: {
        "Content-Type": "application/json",
      },
    };
    context.log.error("GET /sourcedatabase  ERROR: ", error);
  }
};

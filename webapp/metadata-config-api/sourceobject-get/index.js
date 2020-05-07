const appInsights = require("applicationinsights");
appInsights.setup();
const client = appInsights.defaultClient;

module.exports = async function (context, req, configs) {
  try {
    context.res.status(200).json(configs);
  } catch (error) {
    context.res.status(500).json({
      error,
    });
    context.log.error("GET /sourceobject  ERROR: ", error);
  }

  context.done();
};

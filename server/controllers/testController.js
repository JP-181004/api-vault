const { executeRequest } = require("../services/requestExecutionService");

const sendTestRequest = async (req, res) => {
  try {
    const { method, url, headers, body } = req.body || {};

    if (typeof url !== "string" || !url.trim()) {
      return res.status(400).json({
        message: "A valid request URL is required.",
      });
    }

    const result = await executeRequest({
      method,
      url: url.trim(),
      headers,
      body,
    });

    return res.status(200).json({
      status: result.status,
      statusText: result.statusText,
      headers: result.headers,
      body: result.body,
      size: result.size,
    });
  } catch (error) {
    const message = error.message || "The request could not be completed.";

    const isInputError =
      /valid absolute URL|Only HTTP|Credentials embedded|hostname|local or internal|private or reserved|Unsupported HTTP method|Headers must|Header names|Invalid HTTP header|cannot be set manually|cannot contain newlines|body must|exceeds the 1 MB|requests cannot have a body/i.test(
        message
      );

    return res.status(isInputError ? 400 : 502).json({
      message,
    });
  }
};

module.exports = { sendTestRequest };
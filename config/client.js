const { createThirdwebClient } = require("thirdweb");

const dotenv = require('dotenv');

dotenv.config();

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;

if (!clientId) {
    throw new Error("No client ID provided");
}

const client = createThirdwebClient({
    clientId: clientId,
});

module.exports = { client };
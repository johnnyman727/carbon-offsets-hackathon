import dotenv from 'dotenv';
dotenv.config();

const { PORT } = process.env;

import express from 'express';
import cors from 'cors';
import { validateWebhookSignature, getUtilityConnectToken, calculateStatementsAverageUsage } from './utils.js';
import fs from 'fs';
import { balancingAuthorityIdForUtilityName, gridIntensityDataForBalancingAuthorityId } from './grid_mix.js'
import { getCarbonOffsetProjects, buyCarbonOffsetProject } from './carbon_offsets.js';


const port = PORT || 3000;
const app = express();
app.use(express.text({type: '*/*'}));

// Allow the browser to send/receive cookies from the Utility Connect Component in development mode
const corsOptions = {
  credentials: true,
  origin: ['http://localhost:8080'],
};
app.use(cors(corsOptions));

// Absent actual user mgmt, we'll use this global var to keep track of the current User Id
let currentClientUserId = null;
// We will save statement data to this global var #hackathon-code
let averageStatementUsage = null;
// We will save the user's utility name to this global var #hackathon-code
let utilityName = null;

// This endpoint will be used by the FE to request a particular carbon offset project
app.get('/offset_project', async(req, res) => {
  let projectType = req.query.projectType;
  console.log('got this project type', projectType);
  let filterType;

  if (projectType === 'affordable') {
    filterType = {type: 'forestry'};
  }
  else if (projectType === 'local') {
    filterType = {country: 'US'};
  }
  else if (projectType === 'permanent') {
    filterType = {type: 'biomass'};
  }
  else if (projectType === 'rd') {
    filterType = {type: 'mineralization'};
  }

  console.log('type', filterType);
  const projects = await getCarbonOffsetProjects(filterType);

  projects.sort(function (a, b) {
    return a.average_price_per_tonne_cents_usd - b.average_price_per_tonne_cents_usd;
  });

  res.send(projects[1]);
});

app.get('/purchase_project', async(req, res) => {
  let price = req.query.total_price_cents_usd;
  let projectId = req.query.project_id;
  await buyCarbonOffsetProject(projectId, price);
  res.sendStatus(200);
})

// This endpoint will be used by the FE to request details on the carbon intensity of a particular utility
app.get('/grid_mix', async(req, res) => {
  // The utility type should be provided as a param 
  let utilityName = req.query.utilityName;
  // TODO: use the provided utility name
  let balancingAuthorityId = balancingAuthorityIdForUtilityName['PG&E'];
  if (balancingAuthorityId === null) {
    res.sendStatus(400);
  }
  let gridMix = gridIntensityDataForBalancingAuthorityId[balancingAuthorityId];
  if (gridMix === null) {
    res.sendStatus(400);
  }
  res.send(gridMix);

});

// This is the endpoint used by the Utility Connect Component (in utility-connect-widget.jsx) to request a Utility Connect Token
app.post('/utility_connect_token', async (req, res) => {

  try {
    const utilityConnectDetails = await getUtilityConnectToken();
    const utilityConnectToken = utilityConnectDetails.utilityConnectToken;
    console.log("Setting the current user client ID", utilityConnectDetails.clientUserId);
    currentClientUserId = utilityConnectDetails.clientUserId;
    res.json({ utilityConnectToken });
  } catch (error) {

    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.sendStatus(500);
    }
  }
});

// This endpoint should be polled. It will return HTTP 400 when we are still waiting for statement data and
// HTTP 200 with JSON when we have finally received the data
app.get('/statements_average', (req, res) => {
  if (averageStatementUsage !== null) {
    res.json({ averageStatementUsage: averageStatementUsage });
  } else {
    res.sendStatus(400);
  }
});


// This endpoint should be polled. It will return HTTP 400 when we are still waiting for the utility name and
// HTTP 200 with JSON when we have finally received the name
app.get('/utility_name', (req, res) => {
  if (utilityName !== null) {
    res.json({ utilityName: utilityName });
  } else {
    res.sendStatus(400);
  }
});

// This is the endpoint that webhooks are delivered to
app.post('/webhook_listener', (req, res) => {
  // TODO: Disabling webhook signatures validation because it seems to be broken
  // validateWebhookSignature(req);

  const webhookPacket = JSON.parse(req.body);

  // If this isn't a webhook for this particular user, abort
  if (currentClientUserId == null || webhookPacket.data.client_user_id !== currentClientUserId) {
    return res.sendStatus(200);
  }

  console.log('Received a webhook with data:');
  console.dir(JSON.parse(req.body), { depth: null });

  // This is a webhook for statements
  if (webhookPacket.type === 'historical_utility_statements_discovered') {
    // Calculate the monthly average
    averageStatementUsage = calculateStatementsAverageUsage(webhookPacket.data.statements);
    return res.sendStatus(200);
  }

  // This is a webhook for verified creds
  else if (webhookPacket.type === 'utility_credential_verified') {
    // Save the utility name
    utilityName = webhookPacket.data.utility_name;
    return res.sendStatus(200)
  }
  else {
    res.sendStatus(200);
  }

});

// Starts the server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});

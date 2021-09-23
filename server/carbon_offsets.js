import axios from 'axios';
import Patch from '@patch-technology/patch';

import dotenv from 'dotenv';
dotenv.config();

import { env } from 'process';

if (!env['PATCH_TEST_API_KEY']) {
    throw Error("You need to create a .env file with the Patch API key in the /server folder");
}

const patch = Patch.default(env['PATCH_TEST_API_KEY']);

export const getCarbonOffsetProjects = async (filterType={}) => {
    const projects = await patch.projects.retrieveProjects(filterType);
    console.log('projects', projects);
    if (!projects.success) {
        throw Error("Could not fetch carbon offset projects");
    }
    return projects.data;
};

export const buyCarbonOffsetProject = async(projectId, cost) => {
    const projects = await patch.orders.createOrder({ project_id: projectId, total_price_cents_usd: cost });
}
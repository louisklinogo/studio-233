import { Polar } from '@polar-sh/sdk';

const accessToken = process.env.POLAR_ACCESS_TOKEN;

if (!accessToken) {
    throw new Error('POLAR_ACCESS_TOKEN environment variable is not set');
}

export const polarClient = new Polar({
    accessToken,
});

export default polarClient;

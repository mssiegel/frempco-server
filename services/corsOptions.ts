// Allowed client side URLs
const PRODUCTION_URL = 'https://www.frempco.com';
const DEV_URL = 'https://dev.frempco.com';
const LOCAL_URL = 'http://localhost:3000';
const VERCEL_DEPLOY_PREVIEW_URL = /https:..frempco.*vercel.app/;

const corsOptions = {
  origin: [PRODUCTION_URL, DEV_URL, LOCAL_URL, VERCEL_DEPLOY_PREVIEW_URL],
};

export default corsOptions;

import { contentPageLoad } from '../../lib/server/pages/runtime';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = contentPageLoad('/2022-holiday-party/');

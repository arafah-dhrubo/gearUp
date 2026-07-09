import { Router } from 'express';
import { browseGear, getGearDetails, listCategories } from './gear.controller.js';

const router = Router();

router.get('/', browseGear);
router.get('/categories', listCategories);
router.get('/:id', getGearDetails);

export default router;

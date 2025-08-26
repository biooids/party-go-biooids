// src/features/savedEvent/savedEvent.routes.ts

import { Router } from "express";
import { savedEventController } from "./savedEvent.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const requireAuth = authenticate({ required: true });

// This router handles top-level routes like GET /saved-events/me
const savedEventRoutes: Router = Router();
savedEventRoutes.get("/me", requireAuth, savedEventController.getMySavedEvents);

// ✅ FIXED: Added the explicit ': Router' type annotation to resolve the error.
// This sub-router will be nested inside the event routes.
const saveEventSubRouter: Router = Router({ mergeParams: true });

saveEventSubRouter.post("/", requireAuth, savedEventController.saveEvent);
saveEventSubRouter.delete("/", requireAuth, savedEventController.unsaveEvent);

export { savedEventRoutes, saveEventSubRouter };

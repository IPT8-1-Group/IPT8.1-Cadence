const express = require("express");
const router = express.Router();

const modulverwaltungController = require("../controllers/modulverwaltung.Controller");
const {
  validateCreateModule,
  validatePatchModule,
  validateLearningObjectives,
} = require("../middlewares/module.middleware");

router
  .route("/")
  .get(modulverwaltungController.getModules)
  .post(validateCreateModule, modulverwaltungController.createModule);

router.put(
  "/:moduleId/learning-objectives",
  validateLearningObjectives,
  modulverwaltungController.replaceLearningObjectives,
);

router
  .route("/:moduleId")
  .get(modulverwaltungController.getModule)
  .patch(validatePatchModule, modulverwaltungController.patchModule)
  .delete(modulverwaltungController.deleteModule);

module.exports = router;

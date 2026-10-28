function validationError(res, message, fields) {
  return res.status(400).json({
    error: {
      code: "VALIDATION_ERROR",
      message: "Die Eingaben sind ungültig.",
      details: { fields: fields || { request: message } },
    },
  });
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateCreateModule(req, res, next) {
  const body = req.body;
  if (!isObject(body)) {
    return validationError(res, "Ein JSON-Objekt ist erforderlich.");
  }

  const allowedFields = ["code", "title", "description"];
  const unknownField = Object.keys(body).find(
    (field) => !allowedFields.includes(field),
  );
  if (unknownField) {
    return validationError(res, "Unbekanntes Feld.", {
      [unknownField]: "Ist nicht erlaubt.",
    });
  }

  const fields = {};
  for (const field of allowedFields) {
    if (typeof body[field] !== "string") {
      fields[field] = "Muss eine Zeichenfolge sein.";
    } else if (field !== "description" && !body[field].trim()) {
      fields[field] = "Darf nicht leer sein.";
    }
  }

  if (typeof body.code === "string" && body.code.trim().length > 20) {
    fields.code = "Darf höchstens 20 Zeichen enthalten.";
  }
  if (typeof body.title === "string" && body.title.trim().length > 100) {
    fields.title = "Darf höchstens 100 Zeichen enthalten.";
  }
  if (typeof body.description === "string" && body.description.length > 255) {
    fields.description = "Darf höchstens 255 Zeichen enthalten.";
  }
  if (Object.keys(fields).length) {
    return validationError(
      res,
      "Pflichtfelder fehlen oder sind ungültig.",
      fields,
    );
  }

  req.body = {
    code: body.code.trim(),
    title: body.title.trim(),
    description: body.description,
  };
  return next();
}

function validatePatchModule(req, res, next) {
  const body = req.body;
  const allowedFields = ["code", "title", "description", "externalUrl"];
  if (!isObject(body)) {
    return validationError(res, "Ein JSON-Objekt ist erforderlich.");
  }

  const keys = Object.keys(body);
  const unknownField = keys.find((field) => !allowedFields.includes(field));
  if (unknownField) {
    return validationError(res, "Unbekanntes Feld.", {
      [unknownField]: "Ist nicht erlaubt.",
    });
  }
  if (!keys.length) {
    return validationError(
      res,
      "Mindestens ein erlaubtes Feld ist erforderlich.",
    );
  }

  const fields = {};
  for (const field of ["code", "title"]) {
    if (
      field in body &&
      (typeof body[field] !== "string" || !body[field].trim())
    ) {
      fields[field] = "Darf nicht leer sein und muss eine Zeichenfolge sein.";
    }
  }
  if (typeof body.code === "string" && body.code.trim().length > 20) {
    fields.code = "Darf höchstens 20 Zeichen enthalten.";
  }
  if (typeof body.title === "string" && body.title.trim().length > 100) {
    fields.title = "Darf höchstens 100 Zeichen enthalten.";
  }
  if ("description" in body && typeof body.description !== "string") {
    fields.description = "Muss eine Zeichenfolge sein.";
  }
  if (typeof body.description === "string" && body.description.length > 255) {
    fields.description = "Darf höchstens 255 Zeichen enthalten.";
  }
  if ("externalUrl" in body && body.externalUrl !== null) {
    try {
      const url = new URL(body.externalUrl);
      if (!["http:", "https:"].includes(url.protocol) || !url.hostname) {
        throw new Error("Invalid URL");
      }
    } catch {
      fields.externalUrl = "Muss eine absolute HTTP(S)-URL oder null sein.";
    }
  }
  if (Object.keys(fields).length) {
    return validationError(res, "Felder sind ungültig.", fields);
  }

  req.body = { ...body };
  if (typeof req.body.code === "string") req.body.code = req.body.code.trim();
  if (typeof req.body.title === "string")
    req.body.title = req.body.title.trim();
  return next();
}

function validateLearningObjectives(req, res, next) {
  const body = req.body;
  if (
    !isObject(body) ||
    Object.keys(body).length !== 1 ||
    !Array.isArray(body.learningObjectives) ||
    body.learningObjectives.some(
      (objective) => typeof objective !== "string" || !objective.trim(),
    )
  ) {
    return validationError(
      res,
      "learningObjectives muss eine Liste nicht leerer Zeichenfolgen sein.",
      {
        learningObjectives: "Erforderlich; leere Liste ist erlaubt.",
      },
    );
  }
  req.body.learningObjectives = body.learningObjectives.map((objective) =>
    objective.trim(),
  );
  return next();
}

module.exports = {
  validateCreateModule,
  validatePatchModule,
  validateLearningObjectives,
};

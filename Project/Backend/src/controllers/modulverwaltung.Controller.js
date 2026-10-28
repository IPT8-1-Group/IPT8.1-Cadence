const moduleModel = require("../models/modulverwaltungmodels");

function sendError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

function handleDatabaseError(res, error) {
  console.error("Module database operation failed:", error);
  if (error.code === "ER_DUP_ENTRY") {
    return sendError(
      res,
      409,
      "MODULE_CODE_EXISTS",
      "Der Modulcode ist bereits vergeben.",
    );
  }
  return sendError(
    res,
    500,
    "INTERNAL_ERROR",
    "Ein interner Fehler ist aufgetreten.",
  );
}

function parsePositiveInteger(value) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function parseListQuery(query) {
  const allowed = ["search", "sortBy", "sortDirection", "page", "pageSize"];
  const unknownField = Object.keys(query).find(
    (field) => !allowed.includes(field),
  );
  if (unknownField)
    return { error: `Unbekannter Query-Parameter: ${unknownField}` };

  const sortBy = query.sortBy || "updatedAt";
  const sortDirection = query.sortDirection || "desc";
  if (!["code", "title", "updatedAt"].includes(sortBy)) {
    return { error: "sortBy muss code, title oder updatedAt sein." };
  }
  if (!["asc", "desc"].includes(sortDirection)) {
    return { error: "sortDirection muss asc oder desc sein." };
  }
  if (
    query.search !== undefined &&
    (typeof query.search !== "string" || query.search.length > 100)
  ) {
    return {
      error: "search muss eine Zeichenfolge mit höchstens 100 Zeichen sein.",
    };
  }

  const page = query.page === undefined ? 1 : parsePositiveInteger(query.page);
  const pageSize =
    query.pageSize === undefined ? 20 : parsePositiveInteger(query.pageSize);
  if (
    page === null ||
    pageSize === null ||
    pageSize > 100 ||
    !Number.isSafeInteger((page - 1) * pageSize)
  ) {
    return { error: "page muss positiv und pageSize zwischen 1 und 100 sein." };
  }
  return {
    value: {
      search: query.search || "",
      sortBy,
      sortDirection: sortDirection.toUpperCase(),
      page,
      pageSize,
      offset: (page - 1) * pageSize,
    },
  };
}

exports.getModules = async (req, res) => {
  const parsed = parseListQuery(req.query);
  if (parsed.error) {
    return sendError(res, 400, "VALIDATION_ERROR", parsed.error);
  }
  try {
    const { rows, total } = await moduleModel.listModules(parsed.value);
    return res.json({
      data: rows,
      pagination: {
        page: parsed.value.page,
        pageSize: parsed.value.pageSize,
        total,
      },
    });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
};

exports.getModule = async (req, res) => {
  const id = parsePositiveInteger(req.params.moduleId);
  if (id === null) {
    return sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "moduleId muss eine positive Ganzzahl sein.",
    );
  }
  try {
    const module = await moduleModel.getModuleById(id);
    if (!module)
      return sendError(res, 404, "NOT_FOUND", "Modul nicht gefunden.");
    const statistics = await moduleModel.getModuleStatistics(id);
    return res.json({ data: { ...module, statistics } });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
};

exports.createModule = async (req, res) => {
  try {
    const id = await moduleModel.createModule(req.body);
    const module = await moduleModel.getModuleById(id);
    return res.status(201).json({ data: module });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
};

exports.patchModule = async (req, res) => {
  const id = parsePositiveInteger(req.params.moduleId);
  if (id === null) {
    return sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "moduleId muss eine positive Ganzzahl sein.",
    );
  }
  if (Object.hasOwn(req.body, "externalUrl")) {
    return sendError(
      res,
      501,
      "MODULE_FIELD_UNSUPPORTED",
      "externalUrl kann mit dem vorhandenen Datenbankschema nicht gespeichert werden.",
    );
  }
  try {
    const module = await moduleModel.patchModule(id, req.body);
    if (!module)
      return sendError(res, 404, "NOT_FOUND", "Modul nicht gefunden.");
    return res.json({ data: module });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
};

exports.deleteModule = async (req, res) => {
  const id = parsePositiveInteger(req.params.moduleId);
  if (id === null) {
    return sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "moduleId muss eine positive Ganzzahl sein.",
    );
  }
  try {
    const result = await moduleModel.deleteModule(id);
    if (result === "not_found") {
      return sendError(res, 404, "NOT_FOUND", "Modul nicht gefunden.");
    }
    // ich bin mir nicht ganz sicher ob du es so gement hatst mit dme eror code 409
    if (result === "not_empty") {
      return sendError(
        res,
        409,
        "MODULE_NOT_EMPTY",
        "Module mit Kursen können nicht gelöscht werben.",
      );
    }
    return res.status(204).end();
  } catch (error) {
    return handleDatabaseError(res, error);
  }
};

exports.replaceLearningObjectives = async (req, res) => {
  return sendError(
    res,
    501,
    "MODULE_FIELD_UNSUPPORTED",
    "Modul-Lernziele können mit dem vorhandenen Datenbankschema nicht gespeichert werden.",
  );
};

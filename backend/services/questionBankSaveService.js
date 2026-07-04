const { sql } = require('../config/db');
const questionBankSaveModel = require('../Models/questionBankSaveModel');
const questionBankModel = require('../Models/questionBankModel');

const SKILL_TO_TYPE_ID = {
  LISTENING: 1,
  READING: 2,
  WRITING: 3,
};

const SECTION_SET_COLUMN_MAP = {
  sectionName: 'SectionName',
  sourceUrl: 'SourceUrl',
  order: 'Order',
};

const QUESTION_SET_COLUMN_MAP = {
  title: 'Title',
  isActive: 'IsActive',
  score: 'Score',
  allowMultipleAnswers: 'AllowMultipleAnswers',
};

function mapSkillTypeToTypeId(skillType) {
  return SKILL_TO_TYPE_ID[String(skillType ?? '').trim().toUpperCase()] ?? 3;
}

function normalizeSourceUrl(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed || null;
}

function buildSectionInsertRow(data = {}, questionPathId, typeId) {
  return {
    Question_Path_Id: questionPathId,
    SectionName: String(data.sectionName ?? '').trim() || 'Section',
    Title: null,
    TypeId: typeId,
    Order: Number(data.order) || 1,
    SourceUrl: normalizeSourceUrl(data.sourceUrl),
  };
}

async function insertSectionRow(transaction, row) {
  const request = new sql.Request(transaction);
  request.input('questionPathId', sql.Int, row.Question_Path_Id);
  request.input('sectionName', sql.NVarChar(200), row.SectionName);
  request.input('title', sql.NVarChar(200), row.Title);
  request.input('typeId', sql.Int, row.TypeId);
  request.input('order', sql.Int, row.Order);
  request.input('sourceUrl', sql.NVarChar(sql.MAX), row.SourceUrl);

  const result = await request.query(`
    INSERT INTO dbo.Question_Sections (
      Question_Path_Id, SectionName, Title, TypeId, [Order], SourceUrl
    )
    OUTPUT INSERTED.SectionId
    VALUES (
      @questionPathId, @sectionName, @title, @typeId, @order, @sourceUrl
    )
  `);
  return result.recordset[0].SectionId;
}

async function updateSectionRow(transaction, sectionId, set = {}) {
  const sanitizedSet = { ...set };
  delete sanitizedSet.sourceUrl;

  const entries = Object.entries(sanitizedSet).filter(([key]) => SECTION_SET_COLUMN_MAP[key]);
  if (entries.length === 0) return;

  const request = new sql.Request(transaction);
  request.input('sectionId', sql.Int, sectionId);

  const assignments = entries.map(([key, value], index) => {
    const column = SECTION_SET_COLUMN_MAP[key];
    const param = `p${index}`;

    if (column === 'Order') {
      request.input(param, sql.Int, Number(value) || 1);
    } else if (column === 'SourceUrl') {
      request.input(param, sql.NVarChar(sql.MAX), normalizeSourceUrl(value));
    } else {
      request.input(param, sql.NVarChar(200), value ?? null);
    }

    return `[${column}] = @${param}`;
  });

  await request.query(`
    UPDATE dbo.Question_Sections
    SET ${assignments.join(', ')}
    WHERE SectionId = @sectionId
  `);
}

async function updateSectionSourceUrlRow(transaction, sectionId, sourceUrl) {
  const request = new sql.Request(transaction);
  request.input('sectionId', sql.Int, Number(sectionId));
  request.input('sourceUrl', sql.NVarChar(sql.MAX), normalizeSourceUrl(sourceUrl));
  await request.query(`
    UPDATE dbo.Question_Sections
    SET SourceUrl = @sourceUrl
    WHERE SectionId = @sectionId
  `);
}

async function softDeleteQuestions(transaction, deletes = []) {
  for (const item of deletes) {
    const questionId = Number(item.questionId);
    const sectionId = Number(item.sectionId);
    if (!questionId || !sectionId) continue;

    const belongs = await questionBankSaveModel.questionBelongsToSection(
      questionId,
      sectionId,
      transaction,
    );
    if (!belongs) continue;

    const request = new sql.Request(transaction);
    request.input('questionId', sql.Int, questionId);
    request.input('sectionId', sql.Int, sectionId);
    await request.query(`
      UPDATE dbo.Questions
      SET IsActive = 0
      WHERE QuestionId = @questionId AND SectionId = @sectionId
    `);
  }
}

async function insertQuestionRow(transaction, { sectionId, questionPathId, typeId, order, data }) {
  const request = new sql.Request(transaction);
  request.input('sectionId', sql.Int, sectionId);
  request.input('questionPathId', sql.Int, questionPathId);
  request.input('typeId', sql.Int, typeId);
  request.input('title', sql.NVarChar(sql.MAX), String(data.title ?? '').trim() || 'Câu hỏi');
  request.input('isActive', sql.Bit, data.isActive !== false ? 1 : 0);
  request.input('order', sql.Int, Number(order) || 1);
  request.input('score', sql.Int, Number(data.score) || 1);
  request.input('allowMultipleAnswers', sql.Bit, data.allowMultipleAnswers ? 1 : 0);
  request.input('url', sql.NVarChar(sql.MAX), null);

  const result = await request.query(`
    INSERT INTO dbo.Questions (
      SectionId, Title, Question_Path_Id, IsActive, TypeId, URL, [Order], Score, AllowMultipleAnswers
    )
    OUTPUT INSERTED.QuestionId
    VALUES (
      @sectionId, @title, @questionPathId, @isActive, @typeId, @url, @order, @score, @allowMultipleAnswers
    )
  `);
  return result.recordset[0].QuestionId;
}

async function insertChoices(transaction, questionId, choices = []) {
  for (const choice of choices) {
    const data = choice.data ?? choice;
    const title = String(data.title ?? '').trim();
    if (!title) continue;

    const request = new sql.Request(transaction);
    request.input('questionId', sql.Int, questionId);
    request.input('title', sql.NVarChar(250), title);
    request.input('order', sql.Int, Number(data.order) || 1);
    request.input('isTrue', sql.Bit, data.isTrue ? 1 : 0);
    await request.query(`
      INSERT INTO dbo.Question_Choices (QuestionId, Title, [Order], IsTrue)
      VALUES (@questionId, @title, @order, @isTrue)
    `);
  }
}

async function updateQuestionRow(transaction, item) {
  const questionId = Number(item.questionId);
  const sectionId = Number(item.sectionId);
  if (!questionId || !sectionId) return;

  const belongs = await questionBankSaveModel.questionBelongsToSection(
    questionId,
    sectionId,
    transaction,
  );
  if (!belongs) return;

  const set = item.set ?? {};
  const entries = Object.entries(set).filter(([key]) => QUESTION_SET_COLUMN_MAP[key]);
  const request = new sql.Request(transaction);
  request.input('questionId', sql.Int, questionId);
  request.input('sectionId', sql.Int, sectionId);

  const sets = [];
  entries.forEach(([key, value], index) => {
    const column = QUESTION_SET_COLUMN_MAP[key];
    const param = `q${index}`;

    if (column === 'IsActive' || column === 'AllowMultipleAnswers') {
      request.input(param, sql.Bit, value ? 1 : 0);
    } else if (column === 'Score') {
      request.input(param, sql.Int, Number(value) || 1);
    } else if (column === 'Title') {
      request.input(param, sql.NVarChar(sql.MAX), String(value ?? '').trim());
    }

    sets.push(`[${column}] = @${param}`);
  });

  if (item.order != null) {
    request.input('questionOrder', sql.Int, Number(item.order) || 1);
    sets.push('[Order] = @questionOrder');
  }

  if (sets.length > 0) {
    await request.query(`
      UPDATE dbo.Questions
      SET ${sets.join(', ')}
      WHERE QuestionId = @questionId AND SectionId = @sectionId
    `);
  }

  if (Array.isArray(item.choicesReplace)) {
    const deleteRequest = new sql.Request(transaction);
    deleteRequest.input('questionId', sql.Int, questionId);
    await deleteRequest.query(`
      DELETE FROM dbo.Question_Choices
      WHERE QuestionId = @questionId
    `);
    await insertChoices(
      transaction,
      questionId,
      item.choicesReplace.map((choice) => ({ data: choice })),
    );
  }
}

function validateSavePayload(payload) {
  const context = payload?.context ?? {};
  const courseId = Number(context.courseId);
  const pathId = Number(context.pathId);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    const error = new Error('context.courseId không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }
  if (!Number.isInteger(pathId) || pathId <= 0) {
    const error = new Error('context.pathId không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }

  return { context, courseId, pathId };
}

async function saveQuestionBankSectionPayload(payload, { requireExistingSection = false } = {}) {
  const { context, courseId, pathId } = validateSavePayload(payload);
  let sectionId = context.sectionId != null ? Number(context.sectionId) : null;
  const typeId = mapSkillTypeToTypeId(context.skillType);

  if (requireExistingSection) {
    if (!sectionId) {
      const error = new Error('Thiếu context.sectionId khi cập nhật section.');
      error.statusCode = 400;
      throw error;
    }
    const allowed = await questionBankModel.sectionBelongsToCoursePath(sectionId, courseId, pathId);
    if (!allowed) {
      const error = new Error('Không tìm thấy section thuộc course/path này.');
      error.statusCode = 404;
      throw error;
    }
  }

  if (!requireExistingSection && sectionId) {
    const error = new Error('Section đã tồn tại, hãy dùng PUT để cập nhật.');
    error.statusCode = 400;
    throw error;
  }

  const questionPathId = await questionBankSaveModel.resolveQuestionPathId({
    courseId,
    pathId,
    questionPathId: context.questionPathId,
  });

  const questionIdMap = [];
  let savedSourceUrl = null;
  const transaction = new sql.Transaction();
  await transaction.begin();

  try {
    await softDeleteQuestions(transaction, payload.questionsDelete ?? []);

    if (payload.sectionSourceUpdate?.sectionId) {
      const targetSectionId = Number(payload.sectionSourceUpdate.sectionId);
      const allowed = await questionBankModel.sectionBelongsToCoursePath(
        targetSectionId,
        courseId,
        pathId,
      );
      if (!allowed) {
        const error = new Error('Không tìm thấy section để cập nhật URL.');
        error.statusCode = 404;
        throw error;
      }
      savedSourceUrl = normalizeSourceUrl(payload.sectionSourceUpdate.sourceUrl);
      await updateSectionSourceUrlRow(transaction, targetSectionId, savedSourceUrl);
    }

    if (payload.sectionUpdate?.set && sectionId) {
      await updateSectionRow(transaction, sectionId, payload.sectionUpdate.set);
    }

    for (const item of payload.questionsUpdate ?? []) {
      await updateQuestionRow(transaction, item);
    }

    if (payload.sectionInsert?.data) {
      const row = buildSectionInsertRow(payload.sectionInsert.data, questionPathId, typeId);
      sectionId = await insertSectionRow(transaction, row);
      savedSourceUrl = row.SourceUrl;

      for (const question of payload.sectionInsert.questions ?? []) {
        const questionId = await insertQuestionRow(transaction, {
          sectionId,
          questionPathId,
          typeId,
          order: question.order,
          data: question.data ?? {},
        });
        if (question.clientRef) {
          questionIdMap.push({ clientRef: question.clientRef, questionId });
        }
        await insertChoices(transaction, questionId, question.choicesInsert ?? []);
      }
    }

    for (const item of payload.questionsInsert ?? []) {
      const targetSectionId = Number(item.sectionId) || sectionId;
      if (!targetSectionId) continue;

      const questionId = await insertQuestionRow(transaction, {
        sectionId: targetSectionId,
        questionPathId,
        typeId,
        order: item.order,
        data: item.data ?? {},
      });
      if (item.clientRef) {
        questionIdMap.push({ clientRef: item.clientRef, questionId });
      }
      await insertChoices(transaction, questionId, item.choicesInsert ?? []);
    }

    await transaction.commit();
    return {
      sectionId,
      questionPathId,
      questionIdMap,
      sourceUrl: savedSourceUrl,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function updateSectionSourceUrl(sectionId, sourceUrl, { courseId, pathId }) {
  const parsedSectionId = Number(sectionId);
  const parsedCourseId = Number(courseId);
  const parsedPathId = Number(pathId);

  if (!Number.isInteger(parsedSectionId) || parsedSectionId <= 0) {
    const error = new Error('sectionId không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }
  if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0) {
    const error = new Error('courseId không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }
  if (!Number.isInteger(parsedPathId) || parsedPathId <= 0) {
    const error = new Error('pathId không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }

  const allowed = await questionBankModel.sectionBelongsToCoursePath(
    parsedSectionId,
    parsedCourseId,
    parsedPathId,
  );
  if (!allowed) {
    const error = new Error('Không tìm thấy section thuộc course/path này.');
    error.statusCode = 404;
    throw error;
  }

  const normalizedUrl = normalizeSourceUrl(sourceUrl);
  const transaction = new sql.Transaction();
  await transaction.begin();

  try {
    await updateSectionSourceUrlRow(transaction, parsedSectionId, normalizedUrl);
    await transaction.commit();
    return {
      sectionId: parsedSectionId,
      sourceUrl: normalizedUrl,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function deleteQuestionBankSection(sectionId, { courseId, pathId }) {
  const parsedSectionId = Number(sectionId);
  const parsedCourseId = Number(courseId);
  const parsedPathId = Number(pathId);

  if (!Number.isInteger(parsedSectionId) || parsedSectionId <= 0) {
    const error = new Error('sectionId không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }
  if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0) {
    const error = new Error('courseId không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }
  if (!Number.isInteger(parsedPathId) || parsedPathId <= 0) {
    const error = new Error('pathId không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }

  const context = await questionBankSaveModel.getSectionDeleteContext(
    parsedSectionId,
    parsedCourseId,
    parsedPathId,
  );
  if (!context) {
    const error = new Error('Không tìm thấy section thuộc course/path này.');
    error.statusCode = 404;
    throw error;
  }

  const sectionCount = await questionBankSaveModel.countSectionsByPathAndType(
    context.QuestionPathId,
    context.TypeId,
  );
  if (sectionCount <= 1) {
    const error = new Error('Không thể xóa section cuối cùng của kỹ năng này.');
    error.statusCode = 400;
    throw error;
  }

  const transaction = new sql.Transaction();
  await transaction.begin();

  try {
    const deleteChoicesRequest = new sql.Request(transaction);
    deleteChoicesRequest.input('sectionId', sql.Int, parsedSectionId);
    await deleteChoicesRequest.query(`
      DELETE FROM dbo.Question_Choices
      WHERE QuestionId IN (
        SELECT QuestionId FROM dbo.Questions WHERE SectionId = @sectionId
      )
    `);

    const deleteQuestionsRequest = new sql.Request(transaction);
    deleteQuestionsRequest.input('sectionId', sql.Int, parsedSectionId);
    await deleteQuestionsRequest.query(`
      DELETE FROM dbo.Questions
      WHERE SectionId = @sectionId
    `);

    const deleteSectionRequest = new sql.Request(transaction);
    deleteSectionRequest.input('sectionId', sql.Int, parsedSectionId);
    await deleteSectionRequest.query(`
      DELETE FROM dbo.Question_Sections
      WHERE SectionId = @sectionId
    `);

    await transaction.commit();
    return { sectionId: parsedSectionId };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  saveQuestionBankSectionPayload,
  deleteQuestionBankSection,
  updateSectionSourceUrl,
};

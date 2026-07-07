// TODO: update backend/DB MaterialType to support TEXT
import { resolveVideoEmbed } from '@/shared/utils/videoEmbedUtils';
import {
  getFileExtension,
  MATERIAL_UPLOAD_MAX_BYTES,
  MATERIAL_UPLOAD_MAX_SIZE_MESSAGE,
} from '@/shared/utils/materialUploadValidation';
import { getTestDefaultFields } from './mentorTestContentUtils';

export { getTestDefaultFields } from './mentorTestContentUtils';

export const MATERIAL_TYPES = ['VIDEO', 'TEXT', 'DOC'];

/** Học liệu thực tế trong bài học — không gồm bài kiểm tra (quản lý riêng qua ngân hàng câu hỏi). */
export const LEARNING_MATERIAL_TYPES = MATERIAL_TYPES;

export function normalizeMaterialType(type) {
  return String(type ?? '').trim().toUpperCase();
}

export function normalizeMaterialForDisplay(material = {}) {
  const MaterialType = normalizeMaterialType(material.MaterialType ?? material.materialType);

  return {
    ...material,
    MaterialType,
    Title: material.Title ?? material.title ?? '',
    MaterialUrl: material.MaterialUrl ?? material.materialUrl ?? '',
    Content: material.Content ?? material.content ?? '',
    FileName: material.FileName ?? material.fileName ?? '',
    FileSize: material.FileSize ?? material.fileSize ?? null,
    SourceType: material.SourceType ?? material.sourceType ?? null,
    EmbedUrl: material.EmbedUrl ?? material.embedUrl ?? null,
    MaterialId: material.MaterialId ?? material.materialId ?? null,
  };
}

export function getPathNodes(path = {}) {
  return path.nodes ?? path.Nodes ?? [];
}

export function getNodeMaterials(node = {}, { learningOnly = false } = {}) {
  const raw = (node.materials ?? node.Materials ?? []).map(normalizeMaterialForDisplay);
  return learningOnly ? filterLearningMaterials(raw) : raw;
}

export function getCoursePaths(course = {}) {
  return course.paths ?? course.Paths ?? [];
}

export function isLearningMaterial(material) {
  return LEARNING_MATERIAL_TYPES.includes(
    normalizeMaterialType(material?.MaterialType ?? material?.materialType),
  );
}

export function filterLearningMaterials(materials = []) {
  return (materials ?? []).filter(isLearningMaterial);
}

export function countLearningMaterials(materials = []) {
  return filterLearningMaterials(materials).length;
}

export function countMaterialsInPath(path = {}) {
  return getPathNodes(path).reduce(
    (sum, node) => sum + countLearningMaterials(getNodeMaterials(node)),
    0,
  );
}

/** Chương đã có nội dung học (bài học hoặc học liệu). */
export function chapterHasContent(path = {}) {
  const nodes = getPathNodes(path);
  if (nodes.length === 0) return false;
  if (countMaterialsInPath(path) > 0) return true;
  return nodes.some((node) => String(node.NodeName ?? node.nodeName ?? '').trim().length > 0);
}

/** Bài học đã có nội dung (tên hoặc học liệu). */
export function lessonHasContent(node = {}) {
  if (countLearningMaterials(getNodeMaterials(node)) > 0) return true;
  return String(node.NodeName ?? node.nodeName ?? '').trim().length > 0;
}

/** Học liệu đã có nội dung (tiêu đề, link, file hoặc văn bản). */
export function materialHasContent(material = {}) {
  if (String(material.Title ?? '').trim()) return true;
  if (String(material.MaterialUrl ?? '').trim()) return true;
  if (String(material.Content ?? '').trim()) return true;
  if (material.File || material.FileName) return true;
  return false;
}

export const CONTENT_SHORT_DESCRIPTION_MAX = 150;

export function trimShortDescription(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return null;
  return trimmed.slice(0, CONTENT_SHORT_DESCRIPTION_MAX);
}

/** Trích plain text từ HTML — dùng DOM khi có, hỗ trợ tiếng Việt & entity. */
export function extractPlainTextFromHtml(html) {
  const raw = String(html ?? '');
  if (!raw.trim()) return '';

  if (typeof document !== 'undefined') {
    const el = document.createElement('div');
    el.innerHTML = raw;
    return (el.textContent || el.innerText || '')
      .replace(/\u200B|\uFEFF/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;|&#160;|&#xA0;/gi, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/<[^>]+>/g, '')
    .replace(/\u200B|\uFEFF/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isHtmlContentEmpty(html) {
  return extractPlainTextFromHtml(html).length === 0;
}

export const MATERIAL_TYPE_LABELS = {
  VIDEO: 'Video',
  TEXT: 'Văn bản',
  DOC: 'Tài liệu',
  TEST: 'Bài kiểm tra',
};

export const MATERIAL_URL_PLACEHOLDERS = {
  VIDEO: 'Ví dụ: https://youtube.com/watch?v=...',
  TEXT: 'Link văn bản',
  DOC: 'Ví dụ: https://drive.google.com/file/...',
  TEST: 'Ví dụ: https://forms.google.com/...',
};

export const MATERIAL_URL_LABELS = {
  VIDEO: 'Link video',
  TEST: 'Link bài kiểm tra',
};

export const DOC_SOURCE_UPLOAD = 'UPLOAD';
export const DOC_SOURCE_LINK = 'LINK';
export const VIDEO_SOURCE_LINK = 'LINK';

export function getVideoDefaultFields() {
  return {
    SourceType: VIDEO_SOURCE_LINK,
    MaterialUrl: '',
    EmbedUrl: null,
  };
}

export const DOC_ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];

/** Khớp giới hạn Cloudinary free tier. */
export const DOC_MAX_BYTES = MATERIAL_UPLOAD_MAX_BYTES;
export const TEXT_MAX_BYTES = MATERIAL_UPLOAD_MAX_BYTES;

export function getMaterialMaxFileSizeLabel() {
  return '10MB';
}

export function isAllowedDocFile(file) {
  if (!file?.name) return false;
  const ext = getFileExtension(file.name);
  return ['pdf', 'doc', 'docx', 'ppt', 'pptx'].includes(ext ?? '');
}

export function validateDocFile(file) {
  if (!file) {
    return { ok: false, message: 'Vui lòng chọn file tài liệu.' };
  }
  if (!isAllowedDocFile(file)) {
    return { ok: false, message: 'Chỉ hỗ trợ PDF, DOC, DOCX, PPT, PPTX.' };
  }
  if (file.size > DOC_MAX_BYTES) {
    return {
      ok: false,
      message: MATERIAL_UPLOAD_MAX_SIZE_MESSAGE,
    };
  }
  return { ok: true };
}

export function getDocDefaultFields() {
  return {
    SourceType: DOC_SOURCE_UPLOAD,
    File: null,
    FileName: null,
    FileSize: null,
    MaterialUrl: '',
  };
}

export function getDocFileTypeLabel(fileName) {
  const lower = String(fileName ?? '').toLowerCase();
  if (lower.endsWith('.pdf')) return 'PDF';
  if (lower.endsWith('.doc')) return 'DOC';
  if (lower.endsWith('.docx')) return 'DOCX';
  if (lower.endsWith('.ppt')) return 'PPT';
  if (lower.endsWith('.pptx')) return 'PPTX';
  return 'Tài liệu';
}

function getDocExtension(fileNameOrUrl = '') {
  return getFileExtension(fileNameOrUrl);
}

/** URL nhúng iframe xem trước tài liệu (PDF trực tiếp, Office qua Google Docs viewer). */
export function getDocumentPreviewEmbedUrl(materialUrl, fileName = '') {
  const url = String(materialUrl ?? '').trim();
  if (!url) return null;

  const ext = getDocExtension(fileName) || getDocExtension(url);
  if (ext === 'pdf') return url;

  return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
}

export function formatFileSize(bytes) {
  if (bytes == null || Number.isNaN(Number(bytes))) return '';
  const size = Number(bytes);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function serializePathSnapshot(path) {
  const [normalized] = withNormalizedOrders([path]);
  return JSON.stringify(normalized);
}

export function restorePathFromSnapshot(path, savedSnapshot) {
  if (!path?.tempId || !savedSnapshot) return path;
  try {
    const restored = JSON.parse(savedSnapshot);
    return withNormalizedOrders([{ ...restored, tempId: path.tempId }])[0];
  } catch {
    return path;
  }
}

export function isPathSnapshotSaved(path, savedSnapshot) {
  if (!savedSnapshot) return false;
  return serializePathSnapshot(path) === savedSnapshot;
}

function normalizePathFieldsForCompare(path = {}) {
  return {
    PathId: path.PathId ?? null,
    PathName: String(path.PathName ?? '').trim(),
    Description: trimShortDescription(path.Description),
    IsActive: toPathIsActiveValue(path.IsActive ?? path.isActive, 1),
  };
}

function getNodeFromSnapshot(savedSnapshot, nodeTempId) {
  if (!savedSnapshot || !nodeTempId) return null;
  try {
    const baseline = JSON.parse(savedSnapshot);
    const [normalized] = withNormalizedOrders([baseline]);
    const node = (normalized.nodes ?? []).find((item) => item.tempId === nodeTempId);
    if (!node) return null;
    return {
      ...node,
      materials: filterLearningMaterials(node.materials ?? node.Materials ?? []),
    };
  } catch {
    return null;
  }
}

function serializeNodeSnapshot(node) {
  if (!node) return null;
  return JSON.stringify({
    NodeId: node.NodeId ?? null,
    NodeName: String(node.NodeName ?? node.nodeName ?? '').trim(),
    Description: trimShortDescription(node.Description),
    NodeOrder: Number(node.NodeOrder ?? 1),
    materials: filterLearningMaterials(node.materials ?? node.Materials ?? []).map((material) => ({
      MaterialId: material.MaterialId ?? null,
      tempId: material.tempId ?? null,
      MaterialType: material.MaterialType ?? null,
      Title: String(material.Title ?? '').trim(),
      MaterialOrder: Number(material.MaterialOrder ?? 1),
      SourceType: material.SourceType ?? null,
      MaterialUrl: String(material.MaterialUrl ?? '').trim() || null,
      FileName: material.FileName ?? null,
      FileSize: material.FileSize ?? null,
      Content: material.Content ?? null,
    })),
  });
}

/** Chỉ so sánh metadata path (tên, mô tả, xuất bản) — bỏ qua nodes/materials. */
export function isPathFieldsSnapshotSaved(path, savedSnapshot) {
  if (!savedSnapshot) return false;

  let baseline;
  try {
    baseline = JSON.parse(savedSnapshot);
  } catch {
    return false;
  }

  return JSON.stringify(normalizePathFieldsForCompare(path))
    === JSON.stringify(normalizePathFieldsForCompare(baseline));
}

/** So sánh một bài học (kèm học liệu) với snapshot đã lưu của path. */
export function isNodeSnapshotSaved(path, nodeTempId, savedSnapshot) {
  if (!savedSnapshot || !nodeTempId) return false;

  const [normalizedPath] = withNormalizedOrders([path]);
  const node = (normalizedPath.nodes ?? []).find((item) => item.tempId === nodeTempId);
  if (!node) return true;

  const currentNode = {
    ...node,
    materials: filterLearningMaterials(node.materials ?? node.Materials ?? []),
  };
  const baselineNode = getNodeFromSnapshot(savedSnapshot, nodeTempId);

  if (!baselineNode) {
    return serializeNodeSnapshot(currentNode) === serializeNodeSnapshot({
      ...currentNode,
      NodeId: null,
      NodeName: '',
      Description: '',
      materials: [],
    });
  }

  return serializeNodeSnapshot(currentNode) === serializeNodeSnapshot(baselineNode);
}

export function validatePathFieldsForSave(path) {
  const errors = {};

  if (!String(path.PathName ?? '').trim()) {
    errors.PathName = 'Vui lòng nhập tên chương trước khi lưu.';
  }

  return errors;
}

export function validateNodeForSave(node) {
  const fakePath = {
    tempId: '_validate_node',
    PathName: 'placeholder',
    nodes: [node],
  };
  const errors = validateCourseContent([fakePath]);
  return errors.paths?.['_validate_node']?.nodes?.[node.tempId] ?? {};
}

export function getNodeContentValidationToast(nodeErrors = {}, node) {
  if (!node || !nodeErrors || Object.keys(nodeErrors).length === 0) return null;

  if (nodeErrors.NodeName) return nodeErrors.NodeName;
  if (nodeErrors._materials) return nodeErrors._materials;

  for (const material of node.materials ?? node.Materials ?? []) {
    const materialErrors = nodeErrors.materials?.[material.tempId];
    if (!materialErrors) continue;
    const firstError = Object.values(materialErrors).find(Boolean);
    if (firstError) return firstError;
  }

  return 'Vui lòng kiểm tra lại thông tin bài học.';
}

export function validatePathForSave(path) {
  const errors = {};

  if (!String(path.PathName ?? '').trim()) {
    errors.PathName = 'Vui lòng nhập tên chương trước khi lưu.';
  }

  const nodes = path.nodes ?? path.Nodes ?? [];
  if (nodes.length === 0) {
    errors._nodes = 'Mỗi chương cần ít nhất 1 bài học.';
  }

  const nodeErrors = {};
  nodes.forEach((node) => {
    const currentNodeErrors = {};

    if (!String(node.NodeName ?? node.nodeName ?? '').trim()) {
      currentNodeErrors.NodeName = 'Vui lòng nhập tên bài học.';
    }

    if (countLearningMaterials(node.materials ?? node.Materials ?? []) === 0) {
      currentNodeErrors._materials = 'Mỗi bài học cần ít nhất 1 học liệu.';
    }

    if (Object.keys(currentNodeErrors).length > 0) {
      nodeErrors[node.tempId] = currentNodeErrors;
    }
  });

  if (Object.keys(nodeErrors).length > 0) {
    errors.nodes = nodeErrors;
  }

  return errors;
}

export function stripNonLearningMaterials(paths) {
  return withNormalizedOrders(paths).map((path) => ({
    ...path,
    nodes: (path.nodes ?? []).map((node) => ({
      ...node,
      materials: filterLearningMaterials(node.materials ?? node.Materials),
    })),
  }));
}

export function sanitizePathsForStorage(paths) {
  return stripNonLearningMaterials(paths).map((path) => ({
    ...path,
    nodes: (path.nodes ?? []).map((node) => ({
      ...node,
      materials: (node.materials ?? []).map(({ File: _file, ...material }) => material),
    })),
  }));
}

let tempIdCounter = 0;

export function createTempId(prefix = 'tmp') {
  tempIdCounter += 1;
  return `${prefix}_${Date.now()}_${tempIdCounter}`;
}

export function toPathIsActiveValue(value, defaultValue = 1) {
  if (value === true || value === 1 || value === '1') return 1;
  if (value === false || value === 0 || value === '0') return 0;
  return defaultValue;
}

export function isNewUnsavedPath(path = {}) {
  return path.PathId == null;
}

export function isPathActive(path = {}) {
  return toPathIsActiveValue(path.IsActive ?? path.isActive, 1) === 1;
}

export function createEmptyPath() {
  return {
    tempId: createTempId('path'),
    PathName: '',
    Description: '',
    IsActive: 0,
    nodes: [],
  };
}

/** PathId từ server, hoặc thứ tự chương (1-based) khi chưa lưu. */
export function resolveChapterId(path, pathIndex = 0) {
  return path?.PathId ?? pathIndex + 1;
}

export function createEmptyNode() {
  return {
    tempId: createTempId('node'),
    NodeName: '',
    NodeOrder: 1,
    Description: '',
    materials: [],
  };
}

export function createEmptyMaterial() {
  return {
    tempId: createTempId('material'),
    MaterialType: 'VIDEO',
    Title: '',
    MaterialUrl: '',
    Content: '',
    MaterialOrder: 1,
  };
}

export function isSimpleUrl(value) {
  const url = String(value ?? '').trim();
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function withNormalizedOrders(paths) {
  return (paths ?? []).map((path) => {
    const rawNodes = path.nodes ?? path.Nodes ?? [];
    const normalizedNodes = rawNodes.map((node, nodeIndex) => {
      const rawMaterials = node.materials ?? node.Materials ?? [];
      const { Materials: _materials, ...nodeRest } = node;
      return {
        ...nodeRest,
        NodeOrder: nodeIndex + 1,
        materials: filterLearningMaterials(rawMaterials).map((material, materialIndex) => ({
          ...material,
          MaterialOrder: materialIndex + 1,
        })),
      };
    });
    const { Nodes: _nodes, ...pathRest } = path;
    return {
      ...pathRest,
      nodes: normalizedNodes,
    };
  });
}

export function reorderMaterials(materials, fromIndex, toIndex) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= materials.length ||
    toIndex >= materials.length
  ) {
    return materials;
  }
  const next = [...materials];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function countContentStats(paths) {
  const normalized = withNormalizedOrders(paths);
  const pathCount = normalized.length;
  const nodeCount = normalized.reduce((sum, path) => sum + (path.nodes?.length ?? 0), 0);
  const materialCount = normalized.reduce(
    (sum, path) =>
      sum +
      (path.nodes ?? []).reduce(
        (nodeSum, node) => nodeSum + countLearningMaterials(node.materials),
        0,
      ),
    0,
  );

  return { pathCount, nodeCount, materialCount };
}

export function validateCourseContent(paths, options = {}) {
  const errors = { root: [], paths: {} };
  const normalized = withNormalizedOrders(paths);

  if (normalized.length === 0) {
    errors.root.push('Cần ít nhất 1 chương.');
    return errors;
  }

  normalized.forEach((path) => {
    const pathErrors = { nodes: {} };

    if (!String(path.PathName ?? '').trim()) {
      pathErrors.PathName = 'Vui lòng nhập tên chương.';
    }

    if ((path.nodes ?? []).length === 0) {
      pathErrors._nodes = 'Mỗi chương cần ít nhất 1 bài học.';
    }

    (path.nodes ?? []).forEach((node) => {
      const nodeErrors = { materials: {} };

      if (!String(node.NodeName ?? node.nodeName ?? '').trim()) {
        nodeErrors.NodeName = 'Vui lòng nhập tên bài học.';
      }

      if (countLearningMaterials(node.materials ?? node.Materials ?? []) === 0) {
        nodeErrors._materials = 'Mỗi bài học cần ít nhất 1 học liệu.';
      }

      (node.materials ?? []).forEach((material) => {
        if (!isLearningMaterial(material)) return;

        const materialErrors = {};

        if (!material.MaterialType) {
          materialErrors.MaterialType = 'Vui lòng chọn loại học liệu.';
        }

        if (material.MaterialType === 'TEXT') {
          const hasContent = !isHtmlContentEmpty(material.Content);
          const hasUploadedUrl = Boolean(String(material.MaterialUrl ?? '').trim());
          if (!hasContent && !hasUploadedUrl) {
            materialErrors.Content = 'Vui lòng nhập nội dung văn bản';
          } else if (
            hasContent
            && new Blob([String(material.Content ?? '')]).size > TEXT_MAX_BYTES
          ) {
            materialErrors.Content = `Nội dung văn bản quá lớn. Dung lượng tối đa là ${getMaterialMaxFileSizeLabel()}.`;
          }
        } else if (material.MaterialType === 'DOC') {
          if (!String(material.Title ?? '').trim()) {
            materialErrors.Title = 'Vui lòng nhập tiêu đề tài liệu';
          }

          const sourceType =
            material.SourceType === DOC_SOURCE_LINK ? DOC_SOURCE_LINK : DOC_SOURCE_UPLOAD;

          if (sourceType === DOC_SOURCE_UPLOAD) {
            const hasFile = Boolean(material.File);
            const hasUrl = Boolean(String(material.MaterialUrl ?? '').trim());
            if (!hasFile && !hasUrl) {
              materialErrors.File = 'Vui lòng chọn file tài liệu';
            } else if (hasFile) {
              const fileCheck = validateDocFile(material.File);
              if (!fileCheck.ok) {
                materialErrors.File = fileCheck.message;
              }
            }
          } else {
            const materialUrl = String(material.MaterialUrl ?? '').trim();
            if (!materialUrl || !isSimpleUrl(materialUrl)) {
              materialErrors.MaterialUrl = 'Vui lòng nhập link tài liệu hợp lệ';
            }
          }
        } else if (material.MaterialType === 'VIDEO') {
          if (!String(material.Title ?? '').trim()) {
            materialErrors.Title = 'Vui lòng nhập tiêu đề học liệu.';
          }

          const materialUrl = String(material.MaterialUrl ?? '').trim();
          if (materialUrl && !isSimpleUrl(materialUrl)) {
            materialErrors.MaterialUrl = 'Link không hợp lệ. Vui lòng dùng http:// hoặc https://';
          }
        } else {
          if (!String(material.Title ?? '').trim()) {
            materialErrors.Title = 'Vui lòng nhập tiêu đề học liệu.';
          }

          const materialUrl = String(material.MaterialUrl ?? '').trim();
          if (materialUrl && !isSimpleUrl(materialUrl)) {
            materialErrors.MaterialUrl = 'Link không hợp lệ. Vui lòng dùng http:// hoặc https://';
          }
        }

        if (Object.keys(materialErrors).length > 0) {
          nodeErrors.materials[material.tempId] = materialErrors;
        }
      });

      if (Object.keys(nodeErrors.materials).length > 0 || nodeErrors.NodeName || nodeErrors._materials) {
        pathErrors.nodes[node.tempId] = nodeErrors;
      }
    });

    if (
      pathErrors.PathName ||
      pathErrors._nodes ||
      Object.keys(pathErrors.nodes).length > 0
    ) {
      errors.paths[path.tempId] = pathErrors;
    }
  });

  return errors;
}

export function hasContentValidationErrors(errors) {
  if ((errors.root ?? []).length > 0) return true;
  return Object.keys(errors.paths ?? {}).length > 0;
}

export function getPathContentValidationToast(errors = {}, pathTempId, paths = []) {
  if ((errors.root ?? []).length > 0) return errors.root[0];

  const path = paths.find((item) => item.tempId === pathTempId);
  const pathErrors = errors.paths?.[pathTempId];
  if (!path || !pathErrors) return null;

  if (pathErrors.PathName) return pathErrors.PathName;
  if (pathErrors._nodes) return pathErrors._nodes;

  for (const node of path.nodes ?? []) {
    const nodeErrors = pathErrors.nodes?.[node.tempId];
    if (!nodeErrors) continue;
    if (nodeErrors.NodeName) return nodeErrors.NodeName;
    if (nodeErrors._materials) return nodeErrors._materials;

    for (const material of node.materials ?? []) {
      const materialErrors = nodeErrors.materials?.[material.tempId];
      if (!materialErrors) continue;
      const firstMessage = Object.values(materialErrors).find(Boolean);
      if (firstMessage) return firstMessage;
    }
  }

  return null;
}

/** Toast lỗi đầu tiên theo thứ tự validate toàn bộ khóa học. */
export function getFirstContentValidationToast(errors = {}, paths = []) {
  if ((errors.root ?? []).length > 0) return errors.root[0];

  for (const path of paths) {
    const toast = getPathContentValidationToast(errors, path.tempId, paths);
    if (toast) return toast;
  }

  return null;
}

export function hasOtherUnsavedPaths(pathTempId, paths = [], savedPathSnapshots = {}) {
  return paths.some(
    (path) => path.tempId !== pathTempId
      && !isPathSnapshotSaved(path, savedPathSnapshots[path.tempId]),
  );
}

export function getFirstContentErrorTarget(errors, paths = []) {
  if ((errors.root ?? []).length > 0) return 'content-builder-root';

  for (const path of paths) {
    const pathErrors = errors.paths?.[path.tempId];
    if (!pathErrors) continue;

    if (pathErrors.PathName || pathErrors._nodes) {
      return `chapter-${path.tempId}`;
    }

    for (const node of path.nodes ?? []) {
      const nodeErrors = pathErrors.nodes?.[node.tempId];
      if (!nodeErrors) continue;

      if (nodeErrors.NodeName || nodeErrors._materials) return `lesson-${node.tempId}`;

      for (const material of node.materials ?? []) {
        if (nodeErrors.materials?.[material.tempId]) {
          return `material-${material.tempId}`;
        }
      }
    }
  }

  return null;
}

export function parseContentFocusTarget(errorTarget, paths = []) {
  if (!errorTarget || typeof errorTarget !== 'string') return null;

  if (errorTarget.startsWith('chapter-')) {
    return { type: 'chapter', pathTempId: errorTarget.slice('chapter-'.length) };
  }

  if (errorTarget.startsWith('lesson-')) {
    const nodeTempId = errorTarget.slice('lesson-'.length);
    const path = paths.find((p) =>
      (p.nodes ?? p.Nodes ?? []).some((n) => n.tempId === nodeTempId),
    );
    return { type: 'lesson', pathTempId: path?.tempId, nodeTempId };
  }

  if (errorTarget.startsWith('material-')) {
    const materialTempId = errorTarget.slice('material-'.length);
    for (const path of paths) {
      for (const node of path.nodes ?? path.Nodes ?? []) {
        const material = (node.materials ?? node.Materials ?? []).find(
          (m) => m.tempId === materialTempId,
        );
        if (material) {
          return {
            type: 'material',
            pathTempId: path.tempId,
            nodeTempId: node.tempId,
            materialTempId,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Build DOM selector for a content builder item (chapter / lesson / material).
 */
export function getContentItemScrollSelector(target) {
  if (!target?.type) return null;

  if (target.type === 'chapter' && target.pathTempId) {
    return `[data-content-error="chapter-${target.pathTempId}"]`;
  }
  if (target.type === 'lesson' && target.nodeTempId) {
    return `[data-content-error="lesson-${target.nodeTempId}"]`;
  }
  if (target.type === 'material' && target.materialTempId) {
    return `[data-content-error="material-${target.materialTempId}"]`;
  }

  return null;
}

/**
 * Expand parent sections if needed, then scroll to a content builder item.
 */
export function scrollToContentItem(
  target,
  { setExpandedPaths, setExpandedNodes, delayMs = 180 } = {},
) {
  if (target.pathTempId && setExpandedPaths) {
    setExpandedPaths((prev) => ({ ...prev, [target.pathTempId]: true }));
  }
  if (target.nodeTempId && setExpandedNodes) {
    setExpandedNodes((prev) => ({ ...prev, [target.nodeTempId]: true }));
  }

  const selector = getContentItemScrollSelector(target);
  if (!selector) return;

  window.setTimeout(() => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, delayMs);
}

export function buildCourseContentPayload(paths) {
  return {
    paths: withNormalizedOrders(paths).map(({ tempId: _tempId, nodes, ...path }, index) => ({
      PathName: String(path.PathName ?? '').trim(),
      Description: trimShortDescription(path.Description),
      PathOrder: Number(index + 1),
      nodes: (nodes ?? []).map(({ tempId: _nodeTempId, materials, ...node }) => ({
        NodeName: String(node.NodeName ?? node.nodeName ?? '').trim(),
        NodeOrder: node.NodeOrder,
        Description: trimShortDescription(node.Description),
        materials: filterLearningMaterials(materials ?? []).map(
          ({
            tempId: _materialTempId,
            Content,
            File,
            EstimatedMinutes: _estimatedMinutes,
            ...material
          }) => {
            const base = {
              MaterialType: material.MaterialType,
              Title: String(material.Title ?? '').trim(),
              MaterialOrder: material.MaterialOrder,
            };

            if (material.MaterialType === 'TEXT') {
              return {
                ...base,
                SourceType: material.SourceType ?? 'UPLOAD',
                MaterialUrl: String(material.MaterialUrl ?? '').trim() || null,
                FileName: material.FileName ?? null,
                FileSize: material.FileSize ?? null,
              };
            }

            if (material.MaterialType === 'DOC') {
              const sourceType =
                material.SourceType === DOC_SOURCE_LINK ? DOC_SOURCE_LINK : DOC_SOURCE_UPLOAD;

              return {
                ...base,
                SourceType: sourceType,
                MaterialUrl: String(material.MaterialUrl ?? '').trim() || null,
                FileName: material.FileName ?? null,
                FileSize: material.FileSize ?? null,
              };
            }

            if (material.MaterialType === 'VIDEO') {
              const materialUrl = String(material.MaterialUrl ?? '').trim() || null;
              const { embedUrl } = resolveVideoEmbed(materialUrl ?? '');
              // TODO: backend should support EmbedUrl for VIDEO material
              return {
                ...base,
                SourceType: VIDEO_SOURCE_LINK,
                MaterialUrl: materialUrl,
                EmbedUrl: embedUrl,
              };
            }

            return {
              ...base,
              MaterialUrl: String(material.MaterialUrl ?? '').trim() || null,
            };
          }),
      })),
    })),
  };
}

export function buildFullCreateCoursePayload(course, paths) {
  return {
    course,
    ...buildCourseContentPayload(paths),
  };
}

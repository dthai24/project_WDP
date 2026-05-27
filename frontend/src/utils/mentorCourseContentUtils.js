// TODO: update backend/DB MaterialType to support TEXT
import { resolveVideoEmbed } from './videoEmbedUtils';
import {
  buildTestMaterialPayload,
  getTestDefaultFields,
  validateTestMaterial,
} from './mentorTestContentUtils';

export { getTestDefaultFields } from './mentorTestContentUtils';

export const MATERIAL_TYPES = ['VIDEO', 'TEXT', 'DOC', 'TEST'];

export const CONTENT_SHORT_DESCRIPTION_MAX = 150;

export function trimShortDescription(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return null;
  return trimmed.slice(0, CONTENT_SHORT_DESCRIPTION_MAX);
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

export function getDocDefaultFields() {
  return {
    SourceType: DOC_SOURCE_UPLOAD,
    File: null,
    FileName: null,
    FileSize: null,
    MaterialUrl: '',
  };
}

export function isAllowedDocFile(file) {
  if (!file?.name) return false;
  const lower = file.name.toLowerCase();
  return DOC_ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
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

export function formatFileSize(bytes) {
  if (bytes == null || Number.isNaN(Number(bytes))) return '';
  const size = Number(bytes);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function sanitizePathsForStorage(paths) {
  return withNormalizedOrders(paths).map((path) => ({
    ...path,
    nodes: (path.nodes ?? []).map((node) => ({
      ...node,
      materials: (node.materials ?? []).map(({ File: _file, ...material }) => {
        if (material.MaterialType !== 'TEST' || !(material.Sections ?? []).length) {
          return material;
        }

        return {
          ...material,
          Sections: material.Sections.map(({ File: _sectionFile, ...section }) => section),
        };
      }),
    })),
  }));
}

let tempIdCounter = 0;

export function createTempId(prefix = 'tmp') {
  tempIdCounter += 1;
  return `${prefix}_${Date.now()}_${tempIdCounter}`;
}

export function createEmptyPath() {
  return {
    tempId: createTempId('path'),
    PathName: '',
    Description: '',
    nodes: [],
  };
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
  return (paths ?? []).map((path) => ({
    ...path,
    nodes: (path.nodes ?? []).map((node, nodeIndex) => ({
      ...node,
      NodeOrder: nodeIndex + 1,
      materials: (node.materials ?? []).map((material, materialIndex) => ({
        ...material,
        MaterialOrder: materialIndex + 1,
      })),
    })),
  }));
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
      sum + (path.nodes ?? []).reduce((nodeSum, node) => nodeSum + (node.materials?.length ?? 0), 0),
    0,
  );

  return { pathCount, nodeCount, materialCount };
}

export function validateCourseContent(paths) {
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

      if (!String(node.NodeName ?? '').trim()) {
        nodeErrors.NodeName = 'Vui lòng nhập tên bài học.';
      }

      (node.materials ?? []).forEach((material) => {
        const materialErrors = {};

        if (!material.MaterialType) {
          materialErrors.MaterialType = 'Vui lòng chọn loại học liệu.';
        }

        if (material.MaterialType === 'TEXT') {
          const contentHtml = String(material.Content ?? '').trim();
          const contentText = contentHtml.replace(/<[^>]*>/g, '').trim();
          if (!contentText) {
            materialErrors.Content = 'Vui lòng nhập nội dung văn bản';
          }
        } else if (material.MaterialType === 'DOC') {
          if (!String(material.Title ?? '').trim()) {
            materialErrors.Title = 'Vui lòng nhập tiêu đề tài liệu';
          }

          const sourceType =
            material.SourceType === DOC_SOURCE_LINK ? DOC_SOURCE_LINK : DOC_SOURCE_UPLOAD;

          if (sourceType === DOC_SOURCE_UPLOAD) {
            if (!material.File) {
              materialErrors.File = 'Vui lòng chọn file tài liệu';
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
        } else if (material.MaterialType === 'TEST') {
          Object.assign(materialErrors, validateTestMaterial(material));
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

      if (Object.keys(nodeErrors.materials).length > 0 || nodeErrors.NodeName) {
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

      if (nodeErrors.NodeName) return `lesson-${node.tempId}`;

      for (const material of node.materials ?? []) {
        if (nodeErrors.materials?.[material.tempId]) {
          return `material-${material.tempId}`;
        }
      }
    }
  }

  return null;
}

export function buildCourseContentPayload(paths) {
  return {
    paths: withNormalizedOrders(paths).map(({ tempId: _tempId, nodes, ...path }) => ({
      PathName: String(path.PathName ?? '').trim(),
      Description: trimShortDescription(path.Description),
      nodes: (nodes ?? []).map(({ tempId: _nodeTempId, materials, ...node }) => ({
        NodeName: String(node.NodeName ?? '').trim(),
        NodeOrder: node.NodeOrder,
        Description: trimShortDescription(node.Description),
        materials: (materials ?? []).map(
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
            // TODO: backend should support Content for TEXT material
            return {
              ...base,
              MaterialUrl: null,
              Content: String(Content ?? '').trim(),
            };
          }

          if (material.MaterialType === 'DOC') {
            // TODO: backend should support document upload and SourceType
            const sourceType =
              material.SourceType === DOC_SOURCE_LINK ? DOC_SOURCE_LINK : DOC_SOURCE_UPLOAD;

            if (sourceType === DOC_SOURCE_LINK) {
              return {
                ...base,
                SourceType: DOC_SOURCE_LINK,
                File: null,
                FileName: null,
                FileSize: null,
                MaterialUrl: String(material.MaterialUrl ?? '').trim() || null,
              };
            }

            return {
              ...base,
              SourceType: DOC_SOURCE_UPLOAD,
              File: File ?? null,
              FileName: material.FileName ?? null,
              FileSize: material.FileSize ?? null,
              MaterialUrl: null,
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

          if (material.MaterialType === 'TEST') {
            // TODO: backend should support TEST material details: Sections, SkillType, Questions, Options, Pairs, Answers
            return buildTestMaterialPayload(material, {
              ...base,
              Description: trimShortDescription(material.Description),
            });
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

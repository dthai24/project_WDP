// TODO: update backend/DB MaterialType to support TEXT
export const MATERIAL_TYPES = ['VIDEO', 'TEXT', 'DOC', 'TEST'];

export const MATERIAL_TYPE_LABELS = {
  VIDEO: 'Video',
  TEXT: 'Bài đọc',
  DOC: 'Tài liệu',
  TEST: 'Bài kiểm tra',
};

export const MATERIAL_URL_PLACEHOLDERS = {
  VIDEO: 'Link video bài học',
  TEXT: 'Link văn bản',
  DOC: 'Link tài liệu PDF/DOC',
  TEST: 'Link bài kiểm tra',
};

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
          if (!String(material.Title ?? '').trim()) {
            materialErrors.Title = 'Vui lòng nhập tiêu đề bài đọc';
          }

          const contentHtml = String(material.Content ?? '').trim();
          const contentText = contentHtml.replace(/<[^>]*>/g, '').trim();
          if (!contentText) {
            materialErrors.Content = 'Vui lòng nhập nội dung bài đọc';
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
      Description: String(path.Description ?? '').trim() || null,
      nodes: (nodes ?? []).map(({ tempId: _nodeTempId, materials, ...node }) => ({
        NodeName: String(node.NodeName ?? '').trim(),
        NodeOrder: node.NodeOrder,
        Description: String(node.Description ?? '').trim() || null,
        materials: (materials ?? []).map(({ tempId: _materialTempId, Content, EstimatedMinutes: _estimatedMinutes, ...material }) => {
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

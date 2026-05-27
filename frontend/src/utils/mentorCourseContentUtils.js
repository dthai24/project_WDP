export const MATERIAL_TYPES = ['VIDEO', 'DOC', 'TEST'];

export const MATERIAL_TYPE_LABELS = {
  VIDEO: 'Video',
  DOC: 'Tài liệu',
  TEST: 'Bài kiểm tra',
};

export const MATERIAL_URL_PLACEHOLDERS = {
  VIDEO: 'https://youtube.com/... hoặc link video',
  DOC: 'https://.../document.pdf',
  TEST: 'https://.../quiz hoặc link bài kiểm tra',
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
      pathErrors._nodes = 'Mỗi chương cần ít nhất 1 bài.';
    }

    (path.nodes ?? []).forEach((node) => {
      const nodeErrors = { materials: {} };

      if (!String(node.NodeName ?? '').trim()) {
        nodeErrors.NodeName = 'Vui lòng nhập tên bài.';
      }

      (node.materials ?? []).forEach((material) => {
        const materialErrors = {};

        if (!material.MaterialType) {
          materialErrors.MaterialType = 'Vui lòng chọn loại học liệu.';
        }

        if (!String(material.Title ?? '').trim()) {
          materialErrors.Title = 'Vui lòng nhập tiêu đề học liệu.';
        }

        const materialUrl = String(material.MaterialUrl ?? '').trim();
        if (materialUrl && !isSimpleUrl(materialUrl)) {
          materialErrors.MaterialUrl = 'Link không hợp lệ. Vui lòng dùng http:// hoặc https://';
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

export function buildCourseContentPayload(paths) {
  return {
    paths: withNormalizedOrders(paths).map(({ tempId: _tempId, nodes, ...path }) => ({
      PathName: String(path.PathName ?? '').trim(),
      Description: String(path.Description ?? '').trim() || null,
      nodes: (nodes ?? []).map(({ tempId: _nodeTempId, materials, ...node }) => ({
        NodeName: String(node.NodeName ?? '').trim(),
        NodeOrder: node.NodeOrder,
        Description: String(node.Description ?? '').trim() || null,
        materials: (materials ?? []).map(({ tempId: _materialTempId, ...material }) => ({
          MaterialType: material.MaterialType,
          Title: String(material.Title ?? '').trim(),
          MaterialUrl: String(material.MaterialUrl ?? '').trim() || null,
          MaterialOrder: material.MaterialOrder,
        })),
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

import { Box, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MentorPathEditor from './MentorPathEditor';
import MentorContentBlockHeading from './MentorContentSectionHeading';
import { CREATE_CARD_SX, MUTED, TEXT } from './mentorCourseCreateStyles';
import { CHAPTER_THEME, contentAddButtonSx } from './mentorCourseContentStyles';

export default function MentorCourseContentBuilder({
  paths,
  errors = {},
  expandedPaths = {},
  expandedNodes = {},
  onTogglePath,
  onToggleNode,
  onAddPath,
  onPathChange,
  onPathDelete,
  onAddNode,
  onNodeChange,
  onNodeDelete,
  onAddMaterial,
  onMaterialChange,
  onMaterialDelete,
  disabled = false,
  courseName = '',
}) {
  return (
    <Box>
      {courseName && (
        <Box
          sx={{
            ...CREATE_CARD_SX,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: 'rgba(15,23,42,0.06)',
              border: '1px solid rgba(15,23,42,0.08)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <SchoolRoundedIcon sx={{ fontSize: 22, color: TEXT }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12, color: MUTED, fontWeight: 600, mb: 0.25 }}>
              Khóa học
            </Typography>
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: TEXT, lineHeight: 1.35 }}>
              {courseName}
            </Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.75 }}>
        <MentorContentBlockHeading
          Icon={MenuBookRoundedIcon}
          label="Chương học"
          theme={CHAPTER_THEME}
          sx={{ mb: 0 }}
        />
        <Box
          component="button"
          type="button"
          onClick={onAddPath}
          disabled={disabled}
          sx={{
            ...contentAddButtonSx(CHAPTER_THEME),
            cursor: disabled ? 'default' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            flexShrink: 0,
          }}
        >
          <AddRoundedIcon sx={{ fontSize: 18 }} />
          Thêm chương
        </Box>
      </Box>

      {(errors.root ?? []).length > 0 && (
        <Box
          sx={{
            mb: 1.5,
            px: 1.5,
            py: 1,
            borderRadius: '12px',
            bgcolor: 'rgba(220,38,38,0.06)',
            border: '1px solid rgba(220,38,38,0.15)',
          }}
        >
          {(errors.root ?? []).map((message) => (
            <Typography key={message} sx={{ fontSize: 13, color: '#DC2626' }}>
              {message}
            </Typography>
          ))}
        </Box>
      )}

      {paths.length === 0 ? (
        <Box
          sx={{
            ...CREATE_CARD_SX,
            textAlign: 'center',
            py: 4,
            borderLeft: `4px solid ${CHAPTER_THEME.color}`,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              bgcolor: CHAPTER_THEME.bg,
              border: `1px solid ${CHAPTER_THEME.border}`,
              display: 'grid',
              placeItems: 'center',
              mx: 'auto',
              mb: 1.25,
            }}
          >
            <MenuBookRoundedIcon sx={{ fontSize: 26, color: CHAPTER_THEME.color }} />
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: TEXT, mb: 0.75 }}>
            Chưa có chương nào
          </Typography>
          <Typography sx={{ fontSize: 14, color: MUTED, mb: 2, maxWidth: 420, mx: 'auto', lineHeight: 1.55 }}>
            Thêm chương đầu tiên, sau đó tạo bài và học liệu bên trong.
          </Typography>
          <Box
            component="button"
            type="button"
            onClick={onAddPath}
            disabled={disabled}
            sx={{
              ...contentAddButtonSx(CHAPTER_THEME),
              bgcolor: CHAPTER_THEME.bg,
              cursor: disabled ? 'default' : 'pointer',
              px: 2,
              py: 1,
              borderRadius: '999px',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <AddRoundedIcon sx={{ fontSize: 18 }} />
            Thêm chương
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {paths.map((path, pathIndex) => (
            <MentorPathEditor
              key={path.tempId}
              path={path}
              pathIndex={pathIndex}
              errors={errors.paths?.[path.tempId] ?? {}}
              expanded={expandedPaths[path.tempId] !== false}
              expandedNodes={expandedNodes}
              onToggle={() => onTogglePath(path.tempId)}
              onToggleNode={onToggleNode}
              onChange={onPathChange}
              onDelete={() => onPathDelete(path.tempId)}
              onAddNode={() => onAddNode(path.tempId)}
              onNodeChange={(nodeTempId, patch) => onNodeChange(path.tempId, nodeTempId, patch)}
              onNodeDelete={onNodeDelete}
              onAddMaterial={onAddMaterial}
              onMaterialChange={onMaterialChange}
              onMaterialDelete={onMaterialDelete}
              disabled={disabled}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

import { Box, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AppButton from '../../common/AppButton';
import MentorChapterCard from './MentorChapterCard';
import { MUTED, PRIMARY, TEXT } from './mentorCourseCreateStyles';
import { BUILDER_PANEL_SX, CHAPTER_THEME } from './mentorCourseContentStyles';

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
}) {
  return (
    <Box id="content-builder-root" data-content-error="content-builder-root">
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: TEXT, lineHeight: 1.35 }}>
          Nội dung khóa học
        </Typography>
        <Typography sx={{ fontSize: 14, color: MUTED, mt: 0.35, lineHeight: 1.5, maxWidth: 520 }}>
          Tạo chương, bài học và học liệu theo đúng thứ tự học.
        </Typography>
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
        <Box sx={{ ...BUILDER_PANEL_SX, textAlign: 'center', py: 4.5, px: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              bgcolor: CHAPTER_THEME.bg,
              border: `1px solid ${CHAPTER_THEME.border}`,
              display: 'grid',
              placeItems: 'center',
              mx: 'auto',
              mb: 1.25,
            }}
          >
            <MenuBookRoundedIcon sx={{ fontSize: 28, color: CHAPTER_THEME.color }} />
          </Box>
          <Typography sx={{ fontSize: 17, fontWeight: 700, color: TEXT, mb: 0.5 }}>
            Chưa có chương nào
          </Typography>
          <Typography sx={{ fontSize: 14, color: MUTED, mb: 2, maxWidth: 420, mx: 'auto', lineHeight: 1.55 }}>
            Thêm chương đầu tiên để bắt đầu xây dựng nội dung khóa học.
          </Typography>
          <AppButton
            onClick={onAddPath}
            disabled={disabled}
            startIcon={<AddRoundedIcon />}
            sx={{
              height: 40,
              borderRadius: '999px',
              fontWeight: 700,
              bgcolor: PRIMARY,
              '&:hover': { bgcolor: '#0E7490' },
            }}
          >
            Thêm chương
          </AppButton>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {paths.map((path, pathIndex) => (
            <MentorChapterCard
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

          <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 0.25 }}>
            <AppButton
              variant="outlined"
              onClick={onAddPath}
              disabled={disabled}
              startIcon={<AddRoundedIcon />}
              sx={{
                height: 40,
                borderRadius: '999px',
                fontWeight: 700,
                px: 2,
                borderColor: CHAPTER_THEME.border,
                color: CHAPTER_THEME.color,
                '&:hover': {
                  borderColor: CHAPTER_THEME.color,
                  bgcolor: CHAPTER_THEME.bg,
                },
              }}
            >
              Thêm chương
            </AppButton>
          </Box>
        </Box>
      )}
    </Box>
  );
}

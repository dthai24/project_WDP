import { useCallback, useMemo } from 'react';
import { Box, InputBase, Typography } from '@mui/material';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import OndemandVideoRoundedIcon from '@mui/icons-material/OndemandVideoRounded';
import { ContentFieldLabel } from './MentorContentSectionHeading';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import {
  contentFieldSx,
  contentInputInnerSx,
  MATERIAL_TYPE_THEME,
} from './mentorCourseContentStyles';
import {
  COMPACT_VIDEO_PREVIEW_HEIGHT,
  COMPACT_VIDEO_PREVIEW_MAX_WIDTH,
  fetchVideoTitle,
  resolveVideoEmbed,
} from '@/shared/utils/videoEmbedUtils';

// TODO: backend should support EmbedUrl for VIDEO material

const PRIMARY = '#0891B2';
const fieldLabelSx = { mb: 0.5, fontSize: 12, fontWeight: 700, color: '#64748B' };

function VideoPreviewFrame({ previewType, embedUrl }) {
  if (previewType === 'video') {
    return (
      <Box
        component="video"
        src={embedUrl}
        controls
        sx={{
          display: 'block',
          width: '100%',
          height: '100%',
          bgcolor: '#000',
          objectFit: 'contain',
        }}
      />
    );
  }

  return (
    <Box
      component="iframe"
      src={embedUrl}
      title="Xem trước video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      sx={{
        display: 'block',
        width: '100%',
        height: '100%',
        border: 'none',
        bgcolor: '#000',
      }}
    />
  );
}

export function MentorVideoUrlField({
  material,
  errors = {},
  onChange,
  disabled = false,
  compact = false,
}) {
  const applyVideoUrl = useCallback(
    async (value, { fillTitle = false } = {}) => {
      const trimmed = String(value ?? '').trim();
      const { embedUrl } = resolveVideoEmbed(trimmed);
      const patch = {
        MaterialUrl: trimmed,
        EmbedUrl: embedUrl,
        SourceType: 'LINK',
      };

      if (fillTitle && embedUrl) {
        const title = await fetchVideoTitle(trimmed);
        if (title) patch.Title = title;
      }

      onChange(material.tempId, patch);
    },
    [material.tempId, onChange],
  );

  const handleUrlChange = (value) => {
    const { embedUrl } = resolveVideoEmbed(value);
    onChange(material.tempId, {
      MaterialUrl: value,
      EmbedUrl: embedUrl,
      SourceType: 'LINK',
    });
  };

  const handleUrlPaste = useCallback(
    async (event) => {
      const pasted = event.clipboardData?.getData('text')?.trim();
      if (!pasted) return;
      event.preventDefault();
      await applyVideoUrl(pasted, { fillTitle: true });
    },
    [applyVideoUrl],
  );

  return (
    <Box sx={compact ? undefined : { mt: 0 }}>
      <ContentFieldLabel sx={compact ? undefined : fieldLabelSx}>Link video</ContentFieldLabel>
      <Box sx={contentFieldSx(Boolean(errors.MaterialUrl))}>
        <InputBase
          value={material.MaterialUrl ?? ''}
          onChange={(event) => handleUrlChange(event.target.value)}
          onPaste={handleUrlPaste}
          disabled={disabled}
          placeholder="https://youtube.com/watch?v=... hoặc link video"
          fullWidth
          sx={contentInputInnerSx}
        />
      </Box>
      <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.75, lineHeight: 1.45 }}>
        Hỗ trợ YouTube, Vimeo, Google Drive hoặc link .mp4 trực tiếp.
      </Typography>
      {errors.MaterialUrl && (
        <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.35 }}>
          {errors.MaterialUrl}
        </Typography>
      )}
    </Box>
  );
}

export default function MentorVideoMaterialEditor({
  material,
  errors = {},
  onChange,
  disabled = false,
  compact = false,
}) {
  const theme = MATERIAL_TYPE_THEME.VIDEO;
  const materialUrl = String(material.MaterialUrl ?? '').trim();

  const preview = useMemo(() => resolveVideoEmbed(materialUrl), [materialUrl]);
  const canPreview = Boolean(preview.embedUrl && preview.previewType);
  const showUnknownPreview = materialUrl.length > 0 && !canPreview;

  return (
    <Box
      sx={
        compact
          ? { mt: 0 }
          : {
              mt: 1.25,
              ml: { xs: 0, sm: 0.25 },
              p: { xs: 1.25, sm: 1.5 },
              borderRadius: '16px',
              border: `1px solid ${errors.MaterialUrl ? '#FECACA' : 'rgba(15,23,42,0.08)'}`,
              bgcolor: '#F8FAFC',
            }
      }
    >
      {!compact ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
          <PlayCircleRoundedIcon sx={{ fontSize: 20, color: theme.color }} />
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.35 }}>
            Xem trước video
          </Typography>
        </Box>
      ) : null}

      {canPreview ? (
        <Box
          sx={{
            mt: compact ? 2 : 1.25,
            width: '100%',
            display: 'flex',
            justifyContent: compact ? 'center' : 'flex-start',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: compact ? { xs: '100%', sm: COMPACT_VIDEO_PREVIEW_MAX_WIDTH } : '100%',
            }}
          >
            <ContentFieldLabel sx={{ ...fieldLabelSx, mb: 0.75 }}>
              Xem trước
            </ContentFieldLabel>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                ...(compact
                  ? { height: COMPACT_VIDEO_PREVIEW_HEIGHT }
                  : { pt: '56.25%' }),
                borderRadius: compact ? '10px' : '14px',
                overflow: 'hidden',
                border: '1px solid rgba(15,23,42,0.08)',
                bgcolor: '#0F172A',
                mx: compact ? 'auto' : 0,
              }}
            >
              <Box sx={{ position: 'absolute', inset: 0 }}>
                <VideoPreviewFrame
                  previewType={preview.previewType}
                  embedUrl={preview.embedUrl}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      ) : null}

      {showUnknownPreview ? (
        <Box
          sx={{
            mt: compact ? 2 : 1.25,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            p: compact ? 1 : 1.25,
            borderRadius: compact ? '10px' : '14px',
            bgcolor: compact ? 'transparent' : '#fff',
            border: '1px dashed rgba(15,23,42,0.12)',
          }}
        >
          <OndemandVideoRoundedIcon sx={{ fontSize: 20, color: MUTED, mt: 0.1, flexShrink: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: TEXT, lineHeight: 1.45 }}>
              Không thể xem trước link này, nhưng link vẫn có thể được lưu.
            </Typography>
            <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.35, lineHeight: 1.45 }}>
              Link gốc sẽ được giữ nguyên khi lưu học liệu.
            </Typography>
          </Box>
        </Box>
      ) : null}

      {!materialUrl && !canPreview && !showUnknownPreview ? (
        <Box
          sx={{
            mt: compact ? 2 : 1.25,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: compact ? 0.75 : 1.25,
            borderRadius: compact ? '10px' : '14px',
            bgcolor: compact ? 'transparent' : '#fff',
            border: '1px dashed rgba(15,23,42,0.10)',
          }}
        >
          <LinkRoundedIcon sx={{ fontSize: 18, color: MUTED }} />
          <Typography sx={{ fontSize: 12.5, color: MUTED, lineHeight: 1.45 }}>
            Dán link video để xem trước ngay trên trang.
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}

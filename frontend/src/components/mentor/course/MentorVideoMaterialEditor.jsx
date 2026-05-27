import { useMemo } from 'react';
import { Box, InputBase, Typography } from '@mui/material';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import OndemandVideoRoundedIcon from '@mui/icons-material/OndemandVideoRounded';
import { ContentFieldLabel } from './MentorContentSectionHeading';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import { MATERIAL_TYPE_THEME } from './mentorCourseContentStyles';
import { resolveVideoEmbed } from '../../../utils/videoEmbedUtils';

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

export default function MentorVideoMaterialEditor({
  material,
  errors = {},
  onChange,
  disabled = false,
}) {
  const theme = MATERIAL_TYPE_THEME.VIDEO;
  const materialUrl = String(material.MaterialUrl ?? '').trim();

  const preview = useMemo(() => resolveVideoEmbed(materialUrl), [materialUrl]);
  const canPreview = Boolean(preview.embedUrl && preview.previewType);
  const showUnknownPreview = materialUrl.length > 0 && !canPreview;

  const handleUrlChange = (value) => {
    const { embedUrl } = resolveVideoEmbed(value);
    onChange(material.tempId, {
      MaterialUrl: value,
      EmbedUrl: embedUrl,
      SourceType: 'LINK',
    });
  };

  return (
    <Box
      sx={{
        mt: 1.25,
        ml: { xs: 0, sm: 0.25 },
        p: { xs: 1.25, sm: 1.5 },
        borderRadius: '16px',
        border: `1px solid ${
          errors.MaterialUrl ? '#FECACA' : 'rgba(15,23,42,0.08)'
        }`,
        bgcolor: '#F8FAFC',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
        <PlayCircleRoundedIcon sx={{ fontSize: 20, color: theme.color }} />
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.35 }}>
          Gắn link video
        </Typography>
      </Box>

      <ContentFieldLabel sx={fieldLabelSx}>Link video</ContentFieldLabel>
      <InputBase
        value={material.MaterialUrl ?? ''}
        onChange={(event) => handleUrlChange(event.target.value)}
        disabled={disabled}
        placeholder="https://youtube.com/watch?v=... hoặc link video"
        fullWidth
        sx={{
          fontSize: 13,
          color: TEXT,
          px: 1,
          py: 0.65,
          borderRadius: '10px',
          border: `1px solid ${errors.MaterialUrl ? '#DC2626' : 'rgba(15,23,42,0.12)'}`,
          bgcolor: '#fff',
          '&:focus-within': { borderColor: errors.MaterialUrl ? '#DC2626' : PRIMARY },
        }}
      />
      <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.5, lineHeight: 1.45 }}>
        Hỗ trợ YouTube, Vimeo, Google Drive hoặc link .mp4 trực tiếp.
      </Typography>
      {errors.MaterialUrl && (
        <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.35 }}>
          {errors.MaterialUrl}
        </Typography>
      )}

      {canPreview ? (
        <Box sx={{ mt: 1.25 }}>
          <ContentFieldLabel sx={{ ...fieldLabelSx, mb: 0.75 }}>
            Xem trước
          </ContentFieldLabel>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              pt: '56.25%',
              borderRadius: '14px',
              overflow: 'hidden',
              border: '1px solid rgba(15,23,42,0.08)',
              bgcolor: '#0F172A',
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
      ) : null}

      {showUnknownPreview ? (
        <Box
          sx={{
            mt: 1.25,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            p: 1.25,
            borderRadius: '14px',
            bgcolor: '#fff',
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
            mt: 1.25,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.25,
            borderRadius: '14px',
            bgcolor: '#fff',
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

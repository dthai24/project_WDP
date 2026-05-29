import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, IconButton, InputBase, Typography } from '@mui/material';
import AudiotrackRoundedIcon from '@mui/icons-material/AudiotrackRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import AppButton from '@/shared/ui/AppButton';
import { ContentFieldLabel } from './MentorContentSectionHeading';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import { formatFileSize } from '@/features/mentor/utils/mentorCourseContentUtils';
import {
  AUDIO_ALLOWED_EXTENSIONS,
  LISTENING_SOURCE_LINK,
  LISTENING_SOURCE_UPLOAD,
  isAllowedAudioFile,
} from '@/features/mentor/utils/mentorTestContentUtils';

// TODO: backend should support listening section audio upload and AudioSourceType

const INVALID_FILE_MESSAGE = 'Chỉ hỗ trợ file audio: MP3, WAV, M4A, AAC, OGG';

const SOURCE_OPTIONS = [
  { value: LISTENING_SOURCE_UPLOAD, label: 'Tải file lên', icon: CloudUploadRoundedIcon },
  { value: LISTENING_SOURCE_LINK, label: 'Gắn link', icon: LinkRoundedIcon },
];

function SourceOptionButton({ option, selected, disabled, accentColor, onSelect }) {
  const Icon = option.icon;
  const isSelected = selected === option.value;

  return (
    <Box
      component="button"
      type="button"
      disabled={disabled}
      onClick={() => onSelect(option.value)}
      sx={{
        flex: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.75,
        minHeight: 40,
        px: 1.25,
        border: 'none',
        borderRadius: '10px',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 13,
        fontWeight: isSelected ? 700 : 600,
        fontFamily: 'inherit',
        color: isSelected ? accentColor : MUTED,
        bgcolor: isSelected ? `${accentColor}18` : 'transparent',
        transition: 'background-color 0.15s, color 0.15s',
        opacity: disabled ? 0.6 : 1,
        '&:hover': disabled
          ? {}
          : {
              bgcolor: isSelected ? `${accentColor}22` : 'rgba(15,23,42,0.04)',
              color: isSelected ? accentColor : TEXT,
            },
      }}
    >
      <Icon sx={{ fontSize: 18 }} />
      {option.label}
    </Box>
  );
}

function fieldInputSx(hasError, accentColor) {
  return {
    fontSize: 13,
    color: TEXT,
    px: 1,
    py: 0.65,
    borderRadius: '10px',
    border: `1px solid ${hasError ? '#DC2626' : 'rgba(15,23,42,0.12)'}`,
    bgcolor: '#fff',
    width: '100%',
    '&:focus-within': { borderColor: hasError ? '#DC2626' : accentColor },
  };
}

export default function MentorTestListeningSourceEditor({
  section,
  errors = {},
  accentColor,
  disabled = false,
  onChange,
}) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileTypeError, setFileTypeError] = useState('');

  const sourceType =
    section.AudioSourceType === LISTENING_SOURCE_LINK
      ? LISTENING_SOURCE_LINK
      : LISTENING_SOURCE_UPLOAD;
  const hasFile = Boolean(section.File);

  const previewUrl = useMemo(() => {
    if (!section.File) return null;
    return URL.createObjectURL(section.File);
  }, [section.File]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const applyFile = useCallback(
    (file) => {
      if (!file) return;
      if (!isAllowedAudioFile(file)) {
        setFileTypeError(INVALID_FILE_MESSAGE);
        return;
      }
      setFileTypeError('');
      onChange({
        File: file,
        FileName: file.name,
        FileSize: file.size,
      });
    },
    [onChange],
  );

  const handleSourceChange = (nextSource) => {
    if (nextSource === sourceType) return;
    setFileTypeError('');
    if (nextSource === LISTENING_SOURCE_LINK) {
      onChange({
        AudioSourceType: LISTENING_SOURCE_LINK,
        File: null,
        FileName: null,
        FileSize: null,
      });
      return;
    }
    onChange({
      AudioSourceType: LISTENING_SOURCE_UPLOAD,
      AudioUrl: '',
    });
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) applyFile(file);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file) applyFile(file);
  };

  const handleRemoveFile = () => {
    setFileTypeError('');
    onChange({
      File: null,
      FileName: null,
      FileSize: null,
    });
  };

  const fileError = fileTypeError || errors.File;
  const displayFileName = section.File?.name ?? section.FileName ?? '';
  const displayFileSize = section.File?.size ?? section.FileSize;

  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT, mb: 0.75 }}>
        Nguồn audio
      </Typography>

      <ContentFieldLabel sx={{ mb: 0.75, fontSize: 12, fontWeight: 700, color: '#64748B' }}>
        Nguồn nghe
      </ContentFieldLabel>
      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          p: 0.5,
          mb: 1.25,
          borderRadius: '12px',
          bgcolor: '#F8FAFC',
          border: '1px solid rgba(15,23,42,0.08)',
        }}
      >
        {SOURCE_OPTIONS.map((option) => (
          <SourceOptionButton
            key={option.value}
            option={option}
            selected={sourceType}
            disabled={disabled}
            accentColor={accentColor}
            onSelect={handleSourceChange}
          />
        ))}
      </Box>

      {sourceType === LISTENING_SOURCE_UPLOAD ? (
        <>
          {!hasFile && !displayFileName ? (
            <Box
              onDragEnter={(event) => {
                event.preventDefault();
                if (!disabled) setDragOver(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                if (!disabled) setDragOver(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragOver(false);
              }}
              onDrop={handleDrop}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                py: 2,
                px: 2,
                borderRadius: '12px',
                border: `1.5px dashed ${
                  fileError ? '#DC2626' : dragOver ? accentColor : 'rgba(15,23,42,0.14)'
                }`,
                bgcolor: dragOver ? `${accentColor}08` : '#fff',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: `${accentColor}14`,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <AudiotrackRoundedIcon sx={{ fontSize: 22, color: accentColor }} />
              </Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: TEXT, textAlign: 'center' }}>
                Kéo thả file audio vào đây hoặc chọn file
              </Typography>
              <Typography sx={{ fontSize: 12, color: MUTED, textAlign: 'center' }}>
                Hỗ trợ {AUDIO_ALLOWED_EXTENSIONS.join(', ').replace(/\./g, '').toUpperCase()}
              </Typography>
              <AppButton
                variant="outlined"
                size="small"
                startIcon={<CloudUploadRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                sx={{
                  mt: 0.25,
                  minHeight: 34,
                  fontSize: 12,
                  fontWeight: 600,
                  borderColor: `${accentColor}55`,
                  color: accentColor,
                  '&:hover': { borderColor: accentColor, bgcolor: `${accentColor}10` },
                }}
              >
                Chọn file audio
              </AppButton>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept={AUDIO_ALLOWED_EXTENSIONS.join(',')}
                onChange={handleFileInputChange}
              />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: '12px',
                border: '1px solid rgba(15,23,42,0.08)',
                bgcolor: '#fff',
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  bgcolor: `${accentColor}14`,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <AudiotrackRoundedIcon sx={{ fontSize: 20, color: accentColor }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: TEXT,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {displayFileName}
                </Typography>
                {displayFileSize != null ? (
                  <Typography sx={{ fontSize: 11, color: MUTED, mt: 0.25 }}>
                    {formatFileSize(displayFileSize)}
                  </Typography>
                ) : null}
              </Box>
              <IconButton
                size="small"
                onClick={handleRemoveFile}
                disabled={disabled}
                aria-label="Xóa file audio"
                sx={{ color: MUTED, '&:hover': { color: '#DC2626' } }}
              >
                <CloseRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          )}

          {previewUrl ? (
            <Box
              component="audio"
              controls
              src={previewUrl}
              sx={{ display: 'block', width: '100%', mt: 1 }}
            />
          ) : null}

          {fileError ? (
            <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.5 }}>{fileError}</Typography>
          ) : null}
        </>
      ) : (
        <>
          <ContentFieldLabel sx={{ mb: 0.5, fontSize: 12, fontWeight: 700, color: '#64748B' }}>
            Link audio hoặc video nghe
          </ContentFieldLabel>
          <InputBase
            value={section.AudioUrl ?? ''}
            onChange={(event) => onChange({ AudioUrl: event.target.value })}
            disabled={disabled}
            placeholder="https://youtube.com/... hoặc link audio"
            fullWidth
            sx={fieldInputSx(Boolean(errors.AudioUrl), accentColor)}
          />
          {errors.AudioUrl ? (
            <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.25 }}>
              {errors.AudioUrl}
            </Typography>
          ) : null}
        </>
      )}
    </Box>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import { ContentFieldLabel } from './MentorContentSectionHeading';
import MentorTextMaterialEditor from './MentorTextMaterialEditor';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import {
  formatFileSize,
  getDocFileTypeLabel,
  getDocumentPreviewEmbedUrl,
  getMaterialMaxFileSizeLabel,
} from '@/features/mentor/utils/mentorCourseContentUtils';
import {
  READING_DOC_FILE_ACCEPT,
  READING_SOURCE_COMPOSE,
  READING_SOURCE_UPLOAD,
  validateReadingDocFile,
} from '@/features/mentor/utils/mentorTestContentUtils';
import { uploadReadingDocMaterial } from '@/features/mentor/services/materialUploadService';

const READING_PASSAGE_ID = 'reading-passage';
const PREVIEW_HEIGHT = 320;

const SOURCE_OPTIONS = [
  { value: READING_SOURCE_UPLOAD, label: 'Tải file doc', icon: CloudUploadRoundedIcon },
  { value: READING_SOURCE_COMPOSE, label: 'Soạn thảo', icon: EditNoteRoundedIcon },
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
        bgcolor: isSelected ? `${accentColor}14` : 'transparent',
        opacity: disabled ? 0.6 : 1,
        transition: 'background-color 0.15s, color 0.15s',
        '&:hover': disabled
          ? undefined
          : {
              bgcolor: isSelected ? `${accentColor}20` : 'rgba(15,23,42,0.04)',
              color: isSelected ? accentColor : TEXT,
            },
      }}
    >
      <Icon sx={{ fontSize: 18 }} />
      {option.label}
    </Box>
  );
}

function DocumentPreviewFrame({ embedUrl, fileName }) {
  return (
    <Box
      sx={{
        mt: 1,
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid rgba(15,23,42,0.08)',
        bgcolor: '#F8FAFC',
      }}
    >
      <Box
        component="iframe"
        src={embedUrl}
        title={`Xem trước ${fileName || 'tài liệu'}`}
        sx={{
          display: 'block',
          width: '100%',
          height: PREVIEW_HEIGHT,
          border: 'none',
          bgcolor: '#fff',
        }}
      />
    </Box>
  );
}

export default function MentorTestReadingSourceEditor({
  section,
  errors = {},
  accentColor = '#0891B2',
  disabled = false,
  onChange,
  onRegisterControls,
}) {
  const fileInputRef = useRef(null);
  const uploadSeqRef = useRef(0);
  const composeFlushRef = useRef(null);
  const uploadingRef = useRef(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileTypeError, setFileTypeError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  const sourceType =
    section.ReadingSourceType === READING_SOURCE_UPLOAD
      ? READING_SOURCE_UPLOAD
      : READING_SOURCE_COMPOSE;
  const materialUrl = String(section.MaterialUrl ?? '').trim();
  const hasFile = Boolean(section.File || section.FileName || materialUrl);
  const displayFileName = section.File?.name ?? section.FileName ?? '';
  const displayFileSize = section.File?.size ?? section.FileSize;
  const previewEmbedUrl = useMemo(
    () => getDocumentPreviewEmbedUrl(materialUrl, displayFileName),
    [materialUrl, displayFileName],
  );
  const isBusy = disabled || uploading;
  uploadingRef.current = uploading;

  useEffect(() => {
    if (!onRegisterControls) return undefined;
    onRegisterControls({
      flush: () => composeFlushRef.current?.(),
      isBusy: () => uploadingRef.current,
    });
    return () => onRegisterControls(null);
  }, [onRegisterControls]);

  const handleSourceChange = (nextSource) => {
    if (nextSource === sourceType) return;
    setFileTypeError('');
    setUploadError('');
    uploadSeqRef.current += 1;
    if (nextSource === READING_SOURCE_UPLOAD) {
      onChange({
        ReadingSourceType: READING_SOURCE_UPLOAD,
        Description: '',
      });
      return;
    }
    onChange({
      ReadingSourceType: READING_SOURCE_COMPOSE,
      File: null,
      FileName: null,
      FileSize: null,
      MaterialUrl: '',
    });
  };

  const applyFile = useCallback(
    async (file) => {
      if (!file || uploading) return;
      const validation = validateReadingDocFile(file);
      if (!validation.ok) {
        setFileTypeError(validation.message);
        return;
      }

      const seq = ++uploadSeqRef.current;
      setFileTypeError('');
      setUploadError('');
      setUploading(true);
      onChange({
        ReadingSourceType: READING_SOURCE_UPLOAD,
        File: file,
        FileName: file.name,
        FileSize: file.size,
        MaterialUrl: '',
        Description: '',
      });

      try {
        const uploaded = await uploadReadingDocMaterial(file);
        if (seq !== uploadSeqRef.current) return;

        onChange({
          ReadingSourceType: READING_SOURCE_UPLOAD,
          File: null,
          FileName: uploaded.fileName ?? file.name,
          FileSize: uploaded.fileSize ?? file.size,
          MaterialUrl: uploaded.deliveryUrl ?? uploaded.url ?? '',
          Description: '',
        });
      } catch (error) {
        if (seq !== uploadSeqRef.current) return;
        setUploadError(error?.message || 'Không thể tải file lên.');
        onChange({
          File: null,
          FileName: null,
          FileSize: null,
          MaterialUrl: '',
        });
      } finally {
        if (seq === uploadSeqRef.current) {
          setUploading(false);
        }
      }
    },
    [onChange, uploading],
  );

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) applyFile(file);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    if (isBusy) return;
    const file = event.dataTransfer.files?.[0];
    if (file) applyFile(file);
  };

  const handleRemoveFile = () => {
    uploadSeqRef.current += 1;
    setFileTypeError('');
    setUploadError('');
    setUploading(false);
    onChange({
      File: null,
      FileName: null,
      FileSize: null,
      MaterialUrl: '',
    });
  };

  const fileError = fileTypeError || uploadError || errors.File;
  const contentError = errors.Description;

  const handleRegisterComposeFlush = useCallback((flush) => {
    composeFlushRef.current = flush;
    return () => {
      if (composeFlushRef.current === flush) composeFlushRef.current = null;
    };
  }, []);

  return (
    <Box sx={{ mb: 1.5 }}>
      <ContentFieldLabel sx={{ mb: 0.75, fontSize: 12, fontWeight: 700, color: '#64748B' }}>
        Bài đọc
      </ContentFieldLabel>

      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          p: 0.5,
          mb: 1,
          borderRadius: '10px',
          bgcolor: '#fff',
          border: '1px solid rgba(15,23,42,0.08)',
        }}
      >
        {SOURCE_OPTIONS.map((option) => (
          <SourceOptionButton
            key={option.value}
            option={option}
            selected={sourceType}
            disabled={isBusy}
            accentColor={accentColor}
            onSelect={handleSourceChange}
          />
        ))}
      </Box>

      {sourceType === READING_SOURCE_UPLOAD ? (
        <Box
          onDragEnter={(event) => {
            event.preventDefault();
            if (!isBusy && !hasFile) setDragOver(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!isBusy && !hasFile) setDragOver(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragOver(false);
          }}
          onDrop={handleDrop}
          sx={{
            borderRadius: '10px',
            border: `1.5px dashed ${
              fileError ? '#DC2626' : dragOver ? accentColor : 'rgba(15,23,42,0.12)'
            }`,
            bgcolor: dragOver ? 'rgba(15,23,42,0.02)' : '#fff',
            p: 1.15,
          }}
        >
          {hasFile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: 'rgba(15,23,42,0.06)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                {uploading ? (
                  <CircularProgress size={16} sx={{ color: accentColor }} />
                ) : (
                  <InsertDriveFileRoundedIcon sx={{ fontSize: 17, color: MUTED }} />
                )}
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
                  {displayFileName || 'Đang tải file...'}
                </Typography>
                <Typography sx={{ fontSize: 11, color: MUTED, mt: 0.1 }}>
                  {uploading
                    ? 'Đang tải lên Cloudinary...'
                    : `${getDocFileTypeLabel(displayFileName)}${displayFileSize != null ? ` · ${formatFileSize(displayFileSize)}` : ''}`}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={handleRemoveFile}
                disabled={isBusy}
                aria-label="Xóa file"
                sx={{ color: MUTED, '&:hover': { color: '#DC2626' } }}
              >
                <CloseRoundedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: 'rgba(15,23,42,0.05)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <DescriptionRoundedIcon sx={{ fontSize: 17, color: MUTED }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 120 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: TEXT, lineHeight: 1.35 }}>
                  Kéo thả hoặc chọn file doc
                </Typography>
                <Typography sx={{ fontSize: 11, color: MUTED, mt: 0.15 }}>
                  PDF, DOC, DOCX · tối đa {getMaterialMaxFileSizeLabel()}
                </Typography>
              </Box>
              <Box
                component="button"
                type="button"
                disabled={isBusy}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: 'none',
                  borderRadius: '999px',
                  px: 1.25,
                  py: 0.55,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  cursor: isBusy ? 'default' : 'pointer',
                  color: '#fff',
                  bgcolor: accentColor,
                  opacity: isBusy ? 0.6 : 1,
                }}
              >
                Chọn file
              </Box>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept={READING_DOC_FILE_ACCEPT}
                onChange={handleFileInputChange}
              />
            </Box>
          )}
          {fileError ? (
            <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.75 }}>{fileError}</Typography>
          ) : null}
          {!uploading && previewEmbedUrl ? (
            <DocumentPreviewFrame embedUrl={previewEmbedUrl} fileName={displayFileName} />
          ) : null}
        </Box>
      ) : (
        <MentorTextMaterialEditor
          material={{
            tempId: section.tempId ?? READING_PASSAGE_ID,
            Content: section.Description ?? '',
            MaterialUrl: section.MaterialUrl ?? '',
          }}
          errors={{ Content: contentError }}
          disabled={disabled}
          compact
          onRegisterFlush={handleRegisterComposeFlush}
          onChange={(_, patch) => onChange({ Description: patch.Content ?? '' })}
        />
      )}
    </Box>
  );
}

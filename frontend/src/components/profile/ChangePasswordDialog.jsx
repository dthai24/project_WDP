import { useState } from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import UnderlineFieldPopup from "../common/UnderlineFieldPopup";

const EMPTY_FORM = {
  current: "",
  newPassword: "",
  confirm: "",
};

const PASSWORD_FIELDS = [
  {
    name: "current",
    label: "Mật khẩu hiện tại",
    placeholder: "Nhập mật khẩu hiện tại",
    type: "password",
  },
  {
    name: "newPassword",
    label: "Mật khẩu mới",
    placeholder: "Nhập mật khẩu mới",
    type: "password",
  },
  {
    name: "confirm",
    label: "Xác nhận mật khẩu mới",
    placeholder: "Nhập lại mật khẩu mới",
    type: "password",
  },
];

function validatePasswordForm(form) {
  const errors = {};
  if (!form.current.trim()) errors.current = "Vui lòng nhập mật khẩu hiện tại";
  if (!form.newPassword.trim()) errors.newPassword = "Vui lòng nhập mật khẩu mới";
  else if (form.newPassword.length < 6) errors.newPassword = "Mật khẩu mới tối thiểu 6 ký tự";
  if (!form.confirm.trim()) errors.confirm = "Vui lòng xác nhận mật khẩu mới";
  else if (form.confirm !== form.newPassword) errors.confirm = "Mật khẩu xác nhận không khớp";
  return errors;
}

export default function ChangePasswordDialog({ open, onClose, onSubmit, loading = false }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    newPassword: false,
    confirm: false,
  });

  const resetState = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setPasswordVisibility({ current: false, newPassword: false, confirm: false });
  };

  const handleClose = () => {
    resetState();
    onClose?.();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTogglePassword = (name) => {
    setPasswordVisibility((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmit = async () => {
    const nextErrors = validatePasswordForm(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    if (onSubmit) {
      const result = await onSubmit(form);
      if (result === false) return;
    }

    // TODO: gọi API đổi mật khẩu nếu chưa truyền onSubmit
    handleClose();
  };

  return (
    <UnderlineFieldPopup
      open={open}
      onClose={handleClose}
      title="Đổi mật khẩu"
      titleIcon={LockOutlinedIcon}
      description="Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật tài khoản."
      fields={PASSWORD_FIELDS}
      form={form}
      errors={errors}
      onChange={handleChange}
      passwordVisibility={passwordVisibility}
      onTogglePassword={handleTogglePassword}
      submitLabel="Lưu mật khẩu"
      submitIcon={<CheckRoundedIcon />}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}

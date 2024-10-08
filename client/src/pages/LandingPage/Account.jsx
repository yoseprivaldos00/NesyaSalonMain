/* eslint-disable no-unused-vars */
import React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Grid,
  List,
  ListItem,
  Typography,
  Avatar,
  TextField,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import app from "../../firebase.js";
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
} from "../../redux/user/userSlice.js";

const Account = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({});
  const [profilPicture, setProfilePicture] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePercent, setImagePercent] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const userId = currentUser._id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user/${userId}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setFormData(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchData();
  }, [userId, API_URL]);

  const handleDeleteAccount = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`${API_URL}/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data));
        return;
      }
      navigate("/login");
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error));
    }
  };

  const handleFileUpload = useCallback(async (image) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + image.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImagePercent(Math.round(progress));
      },
      () => {
        setImageError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setProfilePicture(downloadURL);
          setFormData((prevData) => ({
            ...prevData,
            profilePicture: downloadURL,
          }));
        });
      }
    );
  }, []);

  useEffect(() => {
    if (image) {
      handleFileUpload(image);
    }
  }, [image, handleFileUpload]);

  const handleChange = (e) => {
    if (e.target.id === "password") {
      setNewPassword(e.target.value);
    } else {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username || formData.username.trim() === "") {
      newErrors.username = "Username is required.";
    }

    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = "Email is required.";
    }

    if (!formData.phoneNumber || formData.phoneNumber.trim() === "") {
      newErrors.phoneNumber = "Phone number is required.";
    }

    if (!newPassword) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    // Return true if no errors, false otherwise
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!validateForm()) {
      return; // Stop submission if there are validation errors
    }

    const dataToUpdate = { ...formData };

    // Include new password only if it has been changed
    if (newPassword !== "") {
      dataToUpdate.password = newPassword;
    }
    try {
      const response = await fetch(`${API_URL}/api/user/update/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToUpdate),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setFormData(updatedData);
        alert("Profil berhasil diperbarui");
      } else {
        const error = await response.json();
        console.error("Error updating user data: ", error);
        alert("Terjadi kesalahan saat memperbarui profil");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Terjadi kesalahan saat memperbarui profil");
    }
  };

  return (
    <Box sx={{ padding: 4, bgcolor: "white", color: "white" }}>
      <Box>
        <Typography
          variant="h3"
          gutterBottom
          fontWeight="bold"
          color="primary.main"
        >
          Akun Saya
        </Typography>
      </Box>
      <Box>
        <Grid container backgroundColor="white">
          <Grid item xs={12} sm={2} gap="5rem" backgroundColor="background.alt">
            <Box
              gap="0.5rem"
              sx={{
                padding: "30px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                borderBottom: 1,
                borderColor: "secondary.main",
              }}
            >
              <Avatar
                src={formData.profilePicture || currentUser.profilePicture}
                sx={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "grey",
                  border: "none",
                }}
                onClick={() => fileRef.current.click()}
              />
              <Typography variant="h6" color="secondary.main">
                Halo, {formData.username}
              </Typography>
            </Box>
            <Box>
              <List>
                <ListItem>
                  <Link
                    to="/account"
                    style={{
                      textDecoration: "none",
                      display: "block",
                      width: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        backgroundColor: "secondary.main",
                        color: "primary.main",
                        textAlign: "center",
                        padding: 1,
                        "&:hover": {
                          backgroundColor: "primary.main",
                          color: "secondary.main",
                        },
                      }}
                      variant="h6"
                    >
                      AKUN
                    </Typography>
                  </Link>
                </ListItem>
                <ListItem>
                  <Link
                    to="/reservation"
                    style={{
                      textDecoration: "none",
                      display: "block",
                      width: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        backgroundColor: "primary.main",
                        color: "secondary.main",
                        textAlign: "center",
                        padding: 1,
                        "&:hover": {
                          backgroundColor: "secondary.main",
                          color: "primary.main",
                        },
                      }}
                      variant="h6"
                    >
                      RESERVASIKU
                    </Typography>
                  </Link>
                </ListItem>
              </List>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            sm={10}
            sx={{ paddingLeft: { xs: 0, md: 2 }, paddingTop: { xs: 2, md: 0 } }}
          >
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "secondary.main",
                margin: "2px 2px 0px 2px",
                padding: 2,
                boxShadow: 3,
              }}
            >
              <Typography variant="h3" fontWeight="bold">
                Profil Saya
              </Typography>
              <Typography variant="subtitle1" mb={2}>
                Kelola informasi profil Anda untuk mengontrol, melindungi, dan
                mengamankan akun
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "white",
                color: "primary.main",
                margin: "2px 2px 0px 2px",
                padding: 2,
                boxShadow: 3,
              }}
            >
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Box>
                      <Typography fontWeight="bold">Ubah Nama</Typography>
                      <TextField
                        margin="dense"
                        fullWidth
                        id="username"
                        name="username"
                        value={formData.username || ""}
                        onChange={handleChange}
                        autoComplete="username"
                        autoFocus
                        error={!!errors.username}
                        helperText={errors.username}
                      />
                      <Typography fontWeight="bold">Ubah Email</Typography>
                      <TextField
                        margin="dense"
                        fullWidth
                        id="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleChange}
                        autoComplete="email"
                        error={!!errors.email}
                        helperText={errors.email}
                      />
                      <Typography fontWeight="bold">Ubah Nomor HP</Typography>
                      <TextField
                        margin="dense"
                        fullWidth
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber || ""}
                        onChange={handleChange}
                        autoComplete="phoneNumber"
                        error={!!errors.phoneNumber}
                        helperText={errors.phoneNumber}
                      />
                      <Typography mb="0.5px" mt="3px" fontWeight="bold">
                        Ubah Password
                      </Typography>
                      <TextField
                        margin="dense"
                        fullWidth
                        id="password"
                        name="password"
                        value={newPassword}
                        onChange={handleChange}
                        autoComplete="current-password"
                        type="password"
                        error={!!errors.password}
                        helperText={errors.password}
                      />
                      <Typography mb="0.5px" mt="3px" fontWeight="bold">
                        Ubah Alamat
                      </Typography>
                      <TextField
                        margin="dense"
                        fullWidth
                        multiline
                        rows={3}
                        id="alamat"
                        name="alamat"
                        value={formData.alamat || ""}
                        onChange={handleChange}
                        autoComplete="alamat"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      alignItems="center"
                      height="100%"
                    >
                      <Avatar
                        src={
                          profilPicture ||
                          formData.profilePicture ||
                          currentUser.profilePicture
                        }
                        onClick={() => fileRef.current.click()}
                        sx={{
                          cursor: "pointer",
                          backgroundColor: "grey",
                          width: "150px",
                          height: "150px",
                          border: 4,
                          borderColor: "background.main",
                        }}
                      />
                      <Typography mt={1} variant="body2" align="center">
                        Pilih Gambar
                      </Typography>
                      <Typography variant="body2" align="center">
                        {imageError && (
                          <span style={{ color: "red" }}>
                            Error uploading image (ukuran file maksimal 2MB)
                          </span>
                        )}
                        {imagePercent > 0 && imagePercent < 100 && (
                          <span style={{ color: "grey" }}>
                            Uploading: {imagePercent} %
                          </span>
                        )}
                        {imagePercent === 100 && (
                          <span style={{ color: "green" }}>
                            Upload Image Berhasil
                          </span>
                        )}
                      </Typography>
                      <input
                        type="file"
                        ref={fileRef}
                        hidden
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                      />
                    </Box>
                  </Grid>
                </Grid>
                <Box display="flex" gap={2}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Ubah
                  </Button>
                  <Button
                    type="button"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2, backgroundColor: "#8c0a47" }}
                    onClick={handleDeleteAccount}
                  >
                    Hapus Akun
                  </Button>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Account;

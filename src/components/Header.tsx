import React from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Github, Home, History, User, Menu, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    { text: "Dashboard", icon: <Home size={20} />, path: "/" },
    { text: "History", icon: <History size={20} />, path: "/history" },
    { text: "Profile", icon: <User size={20} />, path: "/profile" },
  ];

  if (!user) {
    return null;
  }

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 0 8px 2px rgba(0, 123, 255, 0.4)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            cursor: "pointer",
            mr: 1,
            "&:hover": {
              transform: "scale(1.1)",
              boxShadow: "0 0 12px 4px rgba(0, 123, 255, 0.6)",
            },
          }}
        >
          <img
            src="https://i.postimg.cc/FR3xvZ4t/social.png"
            alt="Github"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </Box>
        <Typography variant="h6">Auto-Commit</Typography>
      </Box>

      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogOut size={20} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 1 }}
            >
              <Menu size={24} />
            </IconButton>
          )}

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src="https://i.postimg.cc/FR3xvZ4t/social.png"
              alt="GitHub Logo"
              width={40}
              height={40}
              style={{ marginRight: 8 }}
            />
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: "none",
                color: "inherit",
                display: { xs: "none", sm: "block" },
              }}
            >
              GitHub Auto-Commit
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {!isMobile && (
            <Box sx={{ display: "flex" }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  sx={{
                    mx: 1,
                    color:
                      location.pathname === item.path
                        ? "primary.main"
                        : "inherit",
                    fontWeight:
                      location.pathname === item.path ? "bold" : "normal",
                  }}
                  startIcon={item.icon}
                >
                  {item.text}
                </Button>
              ))}
              <Button
                color="inherit"
                onClick={handleLogout}
                startIcon={<LogOut size={20} />}
                sx={{ ml: 1 }}
              >
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Header;

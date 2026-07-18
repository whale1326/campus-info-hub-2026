"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Dropdown, Space, message, Avatar } from "antd";
import {
  HomeOutlined,
  SearchOutlined,
  ShopOutlined,
  PlusOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  SettingOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ username: string; is_admin: boolean } | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const is_admin = localStorage.getItem("is_admin") === "true";
    if (token && username) {
      setUser({ username, is_admin });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("is_admin");
    setUser(null);
    messageApi.success("已退出登录");
  };

  const userMenu = {
    items: [
      {
        key: "username",
        label: `用户: ${user?.username}`,
        disabled: true,
      },
      {
        key: "profile",
        label: "个人中心",
        icon: <ProfileOutlined />,
        onClick: () => { window.location.href = "/profile"; },
      },
      ...(user?.is_admin
        ? [{
            key: "admin",
            label: "管理后台",
            icon: <SettingOutlined />,
            onClick: () => { window.location.href = "/admin"; },
          }]
        : []),
      { type: "divider" as const },
      {
        key: "logout",
        label: "退出登录",
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  const navItems = [
    { href: "/", label: "首页", icon: <HomeOutlined /> },
    { href: "/lost-found", label: "失物招领", icon: <SearchOutlined /> },
    { href: "/market", label: "二手交易", icon: <ShopOutlined /> },
  ];

  return (
    <>
      {contextHolder}
      <header
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 8px rgba(0, 0, 0, 0.04)",
        }}
      >
        <Space size="large">
          <Link
            href="/"
            style={{
              fontSize: 20,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 800,
              }}
            >
              Campus Hub
            </span>
            <span style={{ fontSize: 16 }}>🏫</span>
          </Link>
          <Space size="middle">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? "nav-link-active" : ""}
                style={{
                  color: pathname === item.href ? "#4f46e5" : "#555",
                  fontWeight: pathname === item.href ? 600 : 500,
                  padding: "8px 16px",
                  borderRadius: 8,
                  transition: "all 0.25s ease",
                  fontSize: 15,
                }}
              >
                <Space size={6}>
                  {item.icon}
                  {item.label}
                </Space>
              </Link>
            ))}
          </Space>
        </Space>

        <Space>
          {user ? (
            <>
              {user.is_admin && (
                <Link href="/admin">
                  <Button
                    icon={<SettingOutlined />}
                    style={{
                      borderRadius: 8,
                      fontWeight: 500,
                      height: 38,
                      border: "1px solid rgba(79, 70, 229, 0.3)",
                      color: "#4f46e5",
                      background: "rgba(79, 70, 229, 0.06)",
                    }}
                  >
                    管理后台
                  </Button>
                </Link>
              )}
              <Link href="/post/create">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{
                    borderRadius: 8,
                    fontWeight: 500,
                    height: 38,
                    background: "var(--gradient-blue)",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
                  }}
                >
                  发布信息
                </Button>
              </Link>
              <Dropdown menu={userMenu}>
                <Space
                  style={{
                    cursor: "pointer",
                    padding: "4px 12px",
                    borderRadius: 8,
                    background: "rgba(79, 70, 229, 0.06)",
                    transition: "all 0.2s",
                  }}
                >
                  <Avatar
                    size={28}
                    style={{
                      background: "var(--gradient-blue)",
                      fontSize: 13,
                    }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <span style={{ fontWeight: 500, color: "#333" }}>
                    {user.username}
                  </span>
                </Space>
              </Dropdown>
            </>
          ) : (
            <Link href="/login">
              <Button
                type="primary"
                icon={<LoginOutlined />}
                style={{
                  borderRadius: 8,
                  fontWeight: 500,
                  height: 38,
                  background: "var(--gradient-blue)",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
                }}
              >
                登录 / 注册
              </Button>
            </Link>
          )}
        </Space>
      </header>
    </>
  );
}

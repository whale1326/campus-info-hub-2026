"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Dropdown, Space, message } from "antd";
import {
  HomeOutlined,
  SearchOutlined,
  ShopOutlined,
  PlusOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (token && username) {
      setUser({ username });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
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
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <Space size="large">
          <Link href="/" style={{ fontSize: 20, fontWeight: 700, color: "#1677ff" }}>
            🏫 校园信息平台
          </Link>
          <Space size="middle">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  color: pathname === item.href ? "#1677ff" : "#333",
                  fontWeight: pathname === item.href ? 600 : 400,
                  padding: "8px 12px",
                  borderRadius: 6,
                  transition: "all 0.2s",
                }}
              >
                <Space size={4}>
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
              <Link href="/post/create">
                <Button type="primary" icon={<PlusOutlined />}>
                  发布信息
                </Button>
              </Link>
              <Dropdown menu={userMenu}>
                <Button icon={<UserOutlined />}>{user.username}</Button>
              </Dropdown>
            </>
          ) : (
            <Link href="/login">
              <Button type="primary" icon={<LoginOutlined />}>
                登录 / 注册
              </Button>
            </Link>
          )}
        </Space>
      </header>
    </>
  );
}

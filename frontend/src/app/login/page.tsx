"use client";

import { useState } from "react";
import { Card, Form, Input, Button, Tabs, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const handleRegister = async (values: {
    username: string;
    password: string;
    contact?: string;
  }) => {
    setLoading(true);
    try {
      const res = await authApi.register(
        values.username,
        values.password,
        values.contact
      );
      localStorage.setItem("token", res.token);
      localStorage.setItem("username", res.user.username);
      messageApi.success("注册成功，已自动登录");
      setTimeout(() => router.push("/"), 1000);
    } catch (err: any) {
      messageApi.error(err.message || "注册失败");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authApi.login(values.username, values.password);
      localStorage.setItem("token", res.token);
      localStorage.setItem("username", res.user.username);
      messageApi.success("登录成功");
      setTimeout(() => router.push("/"), 1000);
    } catch (err: any) {
      messageApi.error(err.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 440,
        margin: "48px auto",
        minHeight: "calc(100vh - 200px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {contextHolder}
      <Card
        className="fade-in-up"
        style={{
          width: "100%",
          borderRadius: 16,
          border: "none",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        {/* Logo / Title */}
        <div style={{ textAlign: "center", marginBottom: 28, marginTop: 8 }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto 16px",
              borderRadius: 16,
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
            }}
          >
            🏫
          </div>
          <h2
            className="gradient-text"
            style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}
          >
            Campus Info Hub
          </h2>
          <p style={{ color: "#999", fontSize: 14, margin: 0 }}>
            校园信息平台
          </p>
        </div>

        <Tabs
          centered
          size="large"
          items={[
            {
              key: "login",
              label: "登录",
              children: (
                <Form
                  onFinish={handleLogin}
                  layout="vertical"
                  size="large"
                  style={{ marginTop: 8 }}
                >
                  <Form.Item
                    name="username"
                    rules={[{ required: true, message: "请输入用户名" }]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: "#999" }} />}
                      placeholder="用户名"
                      style={{ borderRadius: 10, height: 44 }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: "请输入密码" }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: "#999" }} />}
                      placeholder="密码"
                      style={{ borderRadius: 10, height: 44 }}
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={{
                      height: 44,
                      borderRadius: 10,
                      fontWeight: 500,
                      fontSize: 16,
                      background: "var(--gradient-blue)",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                    }}
                  >
                    登录
                  </Button>
                </Form>
              ),
            },
            {
              key: "register",
              label: "注册",
              children: (
                <Form
                  onFinish={handleRegister}
                  layout="vertical"
                  size="large"
                  style={{ marginTop: 8 }}
                >
                  <Form.Item
                    name="username"
                    rules={[
                      { required: true, message: "请输入用户名" },
                      { min: 2, message: "至少2个字符" },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: "#999" }} />}
                      placeholder="用户名"
                      style={{ borderRadius: 10, height: 44 }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: "请输入密码" },
                      { min: 6, message: "至少6个字符" },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: "#999" }} />}
                      placeholder="密码"
                      style={{ borderRadius: 10, height: 44 }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="contact"
                    tooltip="微信号 / 手机号，方便其他人联系你"
                  >
                    <Input
                      prefix={<MailOutlined style={{ color: "#999" }} />}
                      placeholder="联系方式（选填）"
                      style={{ borderRadius: 10, height: 44 }}
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={{
                      height: 44,
                      borderRadius: 10,
                      fontWeight: 500,
                      fontSize: 16,
                      background: "var(--gradient-blue)",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                    }}
                  >
                    注册
                  </Button>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

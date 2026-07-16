"use client";

import { useState } from "react";
import { Card, Form, Input, Button, Tabs, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const handleRegister = async (values: { username: string; password: string; contact?: string }) => {
    setLoading(true);
    try {
      const res = await authApi.register(values.username, values.password, values.contact);
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
    <div style={{ maxWidth: 440, margin: "40px auto" }}>
      {contextHolder}
      <Card>
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>校园信息平台</h2>
        <Tabs
          centered
          items={[
            {
              key: "login",
              label: "登录",
              children: (
                <Form onFinish={handleLogin} layout="vertical" size="large">
                  <Form.Item name="username" rules={[{ required: true, message: "请输入用户名" }]}>
                    <Input prefix={<UserOutlined />} placeholder="用户名" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    登录
                  </Button>
                </Form>
              ),
            },
            {
              key: "register",
              label: "注册",
              children: (
                <Form onFinish={handleRegister} layout="vertical" size="large">
                  <Form.Item name="username" rules={[{ required: true, message: "请输入用户名" }, { min: 2, message: "至少2个字符" }]}>
                    <Input prefix={<UserOutlined />} placeholder="用户名" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: "请输入密码" }, { min: 6, message: "至少6个字符" }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                  </Form.Item>
                  <Form.Item name="contact" tooltip="微信号 / 手机号，方便其他人联系你">
                    <Input placeholder="联系方式（选填）" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
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

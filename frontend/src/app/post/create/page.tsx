"use client";

import { useState } from "react";
import { Card, Form, Input, Button, Select, InputNumber, message, Alert } from "antd";
import { useRouter } from "next/navigation";
import { postsApi, isLoggedIn } from "@/lib/api";

const { TextArea } = Input;

export default function CreatePostPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  if (!isLoggedIn()) {
    return (
      <div style={{ maxWidth: 600, margin: "48px auto" }}>
        <Alert
          message="请先登录"
          description="发布信息需要先登录账号"
          type="warning"
          showIcon
          action={
            <Button
              type="primary"
              size="small"
              onClick={() => router.push("/login")}
              style={{ borderRadius: 8 }}
            >
              去登录
            </Button>
          }
          style={{ borderRadius: 12 }}
        />
      </div>
    );
  }

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const res = await postsApi.create({
        title: values.title,
        content: values.content,
        category: values.category,
        contact: values.contact || "",
        price: values.price || 0,
        image_url: values.image_url || "",
      });
      messageApi.success("发布成功");
      const target = values.category === "market" ? "/market" : "/lost-found";
      setTimeout(() => router.push(`${target}/${res.post.id}`), 1000);
    } catch (err: any) {
      messageApi.error(err.message || "发布失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }} className="fade-in-up">
      {contextHolder}

      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          ✏️ 发布信息
        </h2>
        <p style={{ color: "#999", margin: 0 }}>
          填写以下信息，发布到校园信息平台
        </p>
      </div>

      <Card
        style={{
          borderRadius: 12,
          border: "none",
          boxShadow: "var(--card-shadow)",
        }}
        styles={{ body: { padding: 28 } }}
      >
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ category: "lost_found", price: 0 }}
          size="large"
        >
          <Form.Item
            name="category"
            label="信息类型"
            rules={[{ required: true, message: "请选择信息类型" }]}
          >
            <Select
              options={[
                { label: "🔍 失物招领", value: "lost_found" },
                { label: "🛒 二手交易", value: "market" },
                { label: "📢 信息发布", value: "info" },
              ]}
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item
            name="title"
            label="标题"
            rules={[
              { required: true, message: "请输入标题" },
              { max: 100, message: "标题不能超过100个字符" },
            ]}
          >
            <Input
              placeholder="请输入标题"
              style={{ borderRadius: 10, height: 44 }}
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="详细描述"
            rules={[
              { required: true, message: "请输入详细描述" },
              { min: 10, message: "描述至少10个字符" },
            ]}
          >
            <TextArea
              rows={6}
              placeholder="请详细描述物品特征、丢失/拾到地点、交易要求等..."
              style={{ borderRadius: 10, padding: "12px 14px" }}
            />
          </Form.Item>

          <Form.Item shouldUpdate noStyle>
            {({ getFieldValue }) =>
              getFieldValue("category") === "market" ? (
                <Form.Item
                  name="price"
                  label="价格（元）"
                  rules={[{ required: true, message: "请输入价格" }]}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: "100%", borderRadius: 10, height: 44 }}
                    placeholder="0.00"
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="contact"
            label="联系方式"
            tooltip="微信号 / 手机号，方便其他人联系你"
          >
            <Input
              placeholder="如：微信 abc123 / 138xxxx0000"
              style={{ borderRadius: 10, height: 44 }}
            />
          </Form.Item>

          <Form.Item
            name="image_url"
            label="图片链接"
            tooltip="粘贴图片URL（可选）"
          >
            <Input
              placeholder="https://example.com/image.jpg（选填）"
              style={{ borderRadius: 10, height: 44 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                height: 48,
                borderRadius: 10,
                fontWeight: 500,
                fontSize: 16,
                background: "var(--gradient-blue)",
                border: "none",
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
              }}
            >
              立即发布
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

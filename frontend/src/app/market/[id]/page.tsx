"use client";

import { useEffect, useState } from "react";
import { Card, Tag, Button, Spin, message, Modal, Empty, Row, Col } from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { postsApi, isLoggedIn, type Post } from "@/lib/api";
import CommentSection from "@/components/CommentSection";
import dayjs from "dayjs";

export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  const postId = Number(params.id);

  useEffect(() => {
    if (postId) {
      postsApi
        .get(postId)
        .then((data) => setPost(data.post))
        .catch(() => messageApi.error("加载失败"))
        .finally(() => setLoading(false));
    }
  }, [postId]);

  const handleDelete = () => {
    Modal.confirm({
      title: "确认删除",
      content: "删除后不可恢复，确定要删除这个商品吗？",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await postsApi.delete(postId);
          messageApi.success("删除成功");
          router.push("/market");
        } catch (err: any) {
          messageApi.error(err.message || "删除失败");
        }
      },
    });
  };

  const handleResolve = async () => {
    try {
      await postsApi.update(postId, { status: "resolved" });
      messageApi.success("已标记为已交易");
      const data = await postsApi.get(postId);
      setPost(data.post);
    } catch (err: any) {
      messageApi.error(err.message || "操作失败");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!post) {
    return <Empty description="商品不存在" />;
  }

  const currentUsername =
    typeof window !== "undefined" ? localStorage.getItem("username") : null;
  const isOwner = currentUsername === post.author_name;

  return (
    <div className="fade-in-up">
      {contextHolder}
      <Link href="/market">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          style={{ paddingLeft: 0, marginBottom: 16, color: "#10b981" }}
        >
          返回市场
        </Button>
      </Link>

      <Card
        style={{
          borderRadius: 12,
          border: "none",
          boxShadow: "var(--card-shadow)",
          overflow: "hidden",
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Row gutter={0}>
          {/* Image Section */}
          <Col xs={24} md={10}>
            {post.image_url ? (
              <img
                src={post.image_url}
                alt={post.title}
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 320,
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  height: 360,
                  background: "var(--gradient-green)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 64,
                }}
              >
                <SearchOutlined />
              </div>
            )}
          </Col>

          {/* Info Section */}
          <Col xs={24} md={14}>
            <div style={{ padding: "28px 28px 20px" }}>
              <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
                <Tag color="green" style={{ borderRadius: 4 }}>二手交易</Tag>
                {post.status === "resolved" && (
                  <Tag color="success" style={{ borderRadius: 4 }}>已交易</Tag>
                )}
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, marginBottom: 16, color: "#1a1a2e" }}>
                {post.title}
              </h2>

              <div
                style={{
                  background: "rgba(16, 185, 129, 0.06)",
                  borderRadius: 12,
                  padding: "16px 20px",
                  marginBottom: 20,
                }}
              >
                <span style={{ color: "#999", fontSize: 13 }}>价格</span>
                <div style={{ color: "#ef4444", fontSize: 32, fontWeight: 700 }}>
                  ¥{post.price.toFixed(2)}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <UserOutlined style={{ color: "#4f46e5" }} />
                  <span style={{ color: "#666", fontSize: 14 }}>发布者:</span>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{post.author_name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <PhoneOutlined style={{ color: "#10b981" }} />
                  <span style={{ color: "#666", fontSize: 14 }}>联系方式:</span>
                  <span style={{ fontSize: 14 }}>{post.contact || "未提供"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ClockCircleOutlined style={{ color: "#999" }} />
                  <span style={{ color: "#666", fontSize: 14 }}>发布时间:</span>
                  <span style={{ fontSize: 14 }}>
                    {dayjs(post.created_at).format("YYYY-MM-DD HH:mm")}
                  </span>
                </div>
              </div>

              {isOwner && (
                <div style={{ marginTop: 24, display: "flex", gap: 8 }}>
                  {post.status === "active" && (
                    <Button
                      icon={<CheckCircleOutlined />}
                      onClick={handleResolve}
                      style={{ borderRadius: 8 }}
                    >
                      标记已交易
                    </Button>
                  )}
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                    style={{ borderRadius: 8 }}
                  >
                    删除
                  </Button>
                </div>
              )}
            </div>
          </Col>
        </Row>

        {/* Description */}
        <div style={{ padding: "0 28px 24px" }}>
          <h4 style={{ fontWeight: 600, marginBottom: 12, color: "#1a1a2e" }}>
            商品描述
          </h4>
          <div
            style={{
              background: "#fafbfc",
              padding: 20,
              borderRadius: 12,
              whiteSpace: "pre-wrap",
              lineHeight: 1.9,
              fontSize: 15,
              color: "#333",
              border: "1px solid #f0f0f0",
            }}
          >
            {post.content}
          </div>
        </div>
      </Card>

      <CommentSection postId={post.id} postStatus={post.status} />
    </div>
  );
}

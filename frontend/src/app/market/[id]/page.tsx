"use client";

import { useEffect, useState } from "react";
import { Card, Tag, Descriptions, Button, Spin, message, Modal, Empty, Row, Col } from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { postsApi, isLoggedIn, type Post } from "@/lib/api";
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
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!post) {
    return <Empty description="商品不存在" />;
  }

  const currentUsername = typeof window !== "undefined" ? localStorage.getItem("username") : null;
  const isOwner = currentUsername === post.author_name;

  return (
    <div>
      {contextHolder}
      <Link href="/market">
        <Button type="link" icon={<ArrowLeftOutlined />} style={{ paddingLeft: 0, marginBottom: 16 }}>
          返回市场
        </Button>
      </Link>

      <Card>
        <Row gutter={24}>
          <Col span={10}>
            {post.image_url ? (
              <img
                src={post.image_url}
                alt={post.title}
                style={{ width: "100%", borderRadius: 8 }}
              />
            ) : (
              <div
                style={{
                  height: 300,
                  background: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  color: "#ccc",
                  fontSize: 48,
                }}
              >
                <SearchOutlined />
              </div>
            )}
          </Col>
          <Col span={14}>
            <div style={{ marginBottom: 16 }}>
              <Tag color="green">二手交易</Tag>
              {post.status === "resolved" && <Tag color="success">已交易</Tag>}
            </div>
            <h2>{post.title}</h2>
            <div style={{ color: "#f5222d", fontSize: 28, fontWeight: 700, margin: "16px 0" }}>
              ¥{post.price.toFixed(2)}
            </div>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="发布者">{post.author_name}</Descriptions.Item>
              <Descriptions.Item label="联系方式">{post.contact || "未提供"}</Descriptions.Item>
              <Descriptions.Item label="发布时间">
                {dayjs(post.created_at).format("YYYY-MM-DD HH:mm")}
              </Descriptions.Item>
            </Descriptions>
            {isOwner && (
              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                {post.status === "active" && (
                  <Button icon={<CheckCircleOutlined />} onClick={handleResolve}>
                    标记已交易
                  </Button>
                )}
                <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                  删除
                </Button>
              </div>
            )}
          </Col>
        </Row>

        <div style={{ marginTop: 24 }}>
          <h4>商品描述</h4>
          <div
            style={{
              background: "#fafafa",
              padding: 16,
              borderRadius: 8,
              whiteSpace: "pre-wrap",
              lineHeight: 1.8,
              fontSize: 15,
            }}
          >
            {post.content}
          </div>
        </div>
      </Card>
    </div>
  );
}

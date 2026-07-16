"use client";

import { useEffect, useState } from "react";
import { Card, Tag, Descriptions, Button, Spin, message, Modal, Empty } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { postsApi, isLoggedIn, type Post } from "@/lib/api";
import dayjs from "dayjs";

const categoryLabels: Record<string, string> = {
  lost_found: "失物招领",
  market: "二手交易",
  info: "信息发布",
};

const categoryColors: Record<string, string> = {
  lost_found: "blue",
  market: "green",
  info: "orange",
};

export default function PostDetailPage() {
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
      content: "删除后不可恢复，确定要删除这条信息吗？",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await postsApi.delete(postId);
          messageApi.success("删除成功");
          router.push("/lost-found");
        } catch (err: any) {
          messageApi.error(err.message || "删除失败");
        }
      },
    });
  };

  const handleResolve = async () => {
    try {
      await postsApi.update(postId, { status: "resolved" });
      messageApi.success("已标记为已解决");
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
    return <Empty description="信息不存在" />;
  }

  const currentUsername = typeof window !== "undefined" ? localStorage.getItem("username") : null;
  const isOwner = currentUsername === post.author_name;

  return (
    <div>
      {contextHolder}
      <Link href="/lost-found">
        <Button type="link" icon={<ArrowLeftOutlined />} style={{ paddingLeft: 0, marginBottom: 16 }}>
          返回列表
        </Button>
      </Link>

      <Card
        title={
          <div>
            <Tag color={categoryColors[post.category]}>{categoryLabels[post.category]}</Tag>
            {post.title}
          </div>
        }
        extra={
          isOwner && (
            <div style={{ display: "flex", gap: 8 }}>
              {post.status === "active" && (
                <Button icon={<CheckCircleOutlined />} onClick={handleResolve}>
                  标记已解决
                </Button>
              )}
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                删除
              </Button>
            </div>
          )
        }
      >
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="发布者">{post.author_name}</Descriptions.Item>
          <Descriptions.Item label="发布时间">
            {dayjs(post.created_at).format("YYYY-MM-DD HH:mm:ss")}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            {post.status === "active" ? (
              <Tag color="processing">进行中</Tag>
            ) : post.status === "resolved" ? (
              <Tag color="success">已解决</Tag>
            ) : (
              <Tag color="default">已关闭</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="联系方式">
            {post.contact || post.author_contact || "未提供"}
          </Descriptions.Item>
          {post.category === "market" && (
            <Descriptions.Item label="价格" span={2}>
              <span style={{ color: "#f5222d", fontSize: 18, fontWeight: 700 }}>
                ¥{post.price.toFixed(2)}
              </span>
            </Descriptions.Item>
          )}
        </Descriptions>

        <div style={{ marginTop: 24 }}>
          <h4>详细内容</h4>
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

        {post.image_url && (
          <div style={{ marginTop: 16 }}>
            <h4>图片</h4>
            <img
              src={post.image_url}
              alt={post.title}
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          </div>
        )}

        <div style={{ marginTop: 24, color: "#999", fontSize: 13 }}>
          最后更新: {dayjs(post.updated_at).format("YYYY-MM-DD HH:mm:ss")}
        </div>
      </Card>
    </div>
  );
}

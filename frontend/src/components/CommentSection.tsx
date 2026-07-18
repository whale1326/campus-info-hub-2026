"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Input,
  Button,
  Avatar,
  Spin,
  Empty,
  message,
  Modal,
  Tooltip,
} from "antd";
import {
  CommentOutlined,
  DeleteOutlined,
  UserOutlined,
  SendOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { commentsApi, isLoggedIn, isAdmin, type Comment } from "@/lib/api";

const { TextArea } = Input;

interface CommentSectionProps {
  postId: number;
  postStatus?: string;
}

export default function CommentSection({ postId, postStatus }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      const data = await commentsApi.list(postId);
      setComments(data.comments);
    } catch {
      messageApi.error("加载评论失败");
    } finally {
      setLoading(false);
    }
  }, [postId, messageApi]);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setAdmin(isAdmin());
    setCurrentUsername(
      typeof window !== "undefined" ? localStorage.getItem("username") : null
    );
    loadComments();
  }, [loadComments]);

  const handleSubmit = async () => {
    const text = content.trim();
    if (!text) {
      messageApi.warning("请输入评论内容");
      return;
    }
    setSubmitting(true);
    try {
      const data = await commentsApi.create(postId, text);
      setComments([...comments, data.comment]);
      setContent("");
      messageApi.success("评论成功");
    } catch (err: any) {
      messageApi.error(err.message || "评论失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (commentId: number) => {
    Modal.confirm({
      title: "删除评论",
      content: "确定要删除这条评论吗？",
      okText: "删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await commentsApi.delete(commentId);
          setComments(comments.filter((c) => c.id !== commentId));
          messageApi.success("已删除");
        } catch (err: any) {
          messageApi.error(err.message || "删除失败");
        }
      },
    });
  };

  const canDelete = (comment: Comment) => {
    return comment.author_name === currentUsername || admin;
  };

  const closed = postStatus === "closed";

  return (
    <Card
      style={{
        marginTop: 20,
        borderRadius: 12,
        border: "none",
        boxShadow: "var(--card-shadow)",
      }}
      styles={{ body: { padding: 24 } }}
    >
      {contextHolder}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <CommentOutlined style={{ fontSize: 18, color: "#4f46e5" }} />
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1a1a2e" }}>
          评论留言
        </h3>
        <span style={{ color: "#999", fontSize: 13 }}>
          ({comments.length})
        </span>
      </div>

      {/* Comment Input */}
      {closed ? (
        <div
          style={{
            textAlign: "center",
            padding: 16,
            color: "#999",
            background: "#fafbfc",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          该帖子已关闭，无法评论
        </div>
      ) : loggedIn ? (
        <div style={{ marginBottom: 24 }}>
          <TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的评论..."
            autoSize={{ minRows: 2, maxRows: 5 }}
            maxLength={500}
            showCount
            style={{ borderRadius: 8, marginBottom: 8 }}
          />
          <div style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={submitting}
              onClick={handleSubmit}
              style={{ borderRadius: 8, background: "var(--primary-color)" }}
            >
              发表评论
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: 16,
            color: "#999",
            background: "#fafbfc",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          请先登录后参与评论
        </div>
      )}

      {/* Comment List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : comments.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无评论"
          style={{ padding: "20px 0" }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {comments.map((comment, index) => (
            <div
              key={comment.id}
              style={{
                display: "flex",
                gap: 12,
                padding: "16px 0",
                borderTop: index === 0 ? "1px solid #f0f0f0" : "none",
                borderBottom: "1px solid #f5f5f5",
              }}
            >
              <Avatar
                size={36}
                icon={<UserOutlined />}
                style={{
                  flexShrink: 0,
                  background: comment.author_is_admin
                    ? "#f59e0b"
                    : "var(--primary-color)",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>
                    {comment.author_name}
                  </span>
                  {comment.author_is_admin && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: "1px 6px",
                        borderRadius: 4,
                        background: "rgba(245, 158, 11, 0.1)",
                        color: "#f59e0b",
                        fontWeight: 500,
                      }}
                    >
                      管理员
                    </span>
                  )}
                  <span style={{ color: "#bbb", fontSize: 12 }}>
                    {dayjs(comment.created_at).format("MM-DD HH:mm")}
                  </span>
                  {canDelete(comment) && (
                    <Tooltip title="删除评论">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(comment.id)}
                        style={{ marginLeft: "auto", padding: "0 4px" }}
                      />
                    </Tooltip>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "#333",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {comment.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

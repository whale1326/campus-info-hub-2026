"use client";

import { useEffect, useState } from "react";
import { Card, Tag, Input, Empty, Spin, Segmented, message, Button } from "antd";
import { SearchOutlined, PlusOutlined, EnvironmentOutlined, ClockCircleOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

const categoryStyles: Record<string, { gradient: string; bg: string }> = {
  lost_found: { gradient: "var(--gradient-blue)", bg: "rgba(79, 70, 229, 0.08)" },
  market: { gradient: "var(--gradient-green)", bg: "rgba(16, 185, 129, 0.08)" },
  info: { gradient: "var(--gradient-orange)", bg: "rgba(245, 158, 11, 0.08)" },
};

export default function LostFoundPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("all");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();

  const fetchPosts = (kw?: string, cat?: string) => {
    setLoading(true);
    const params: any = { page_size: 50 };
    if (cat && cat !== "all") params.category = cat;
    if (kw) params.keyword = kw;
    postsApi
      .list(params)
      .then((data) => setPosts(data.posts))
      .catch(() => messageApi.error("加载失败"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const cat = searchParams.get("category") || "all";
    setFilter(cat);
    fetchPosts("", cat);
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setKeyword(value);
    fetchPosts(value, filter);
  };

  const handleFilterChange = (value: string | number) => {
    const v = String(value);
    setFilter(v);
    fetchPosts(keyword, v);
  };

  return (
    <div className="fade-in-up">
      {contextHolder}
      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          🔍 失物招领 & 信息发布
        </h2>
        <p style={{ color: "#999", margin: 0 }}>浏览校园内的失物招领和信息发布</p>
      </div>

      <Card
        style={{
          borderRadius: 12,
          border: "none",
          boxShadow: "var(--card-shadow)",
        }}
        extra={
          isLoggedIn() && (
            <Link href="/post/create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{
                  borderRadius: 8,
                  background: "var(--gradient-blue)",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
                }}
              >
                发布信息
              </Button>
            </Link>
          )
        }
        styles={{
          body: { padding: 20 },
        }}
      >
        {/* Search & Filter Bar */}
        <div
          style={{
            marginBottom: 20,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Input.Search
            placeholder="搜索标题或内容..."
            allowClear
            style={{ width: 320, borderRadius: 10 }}
            onSearch={handleSearch}
            prefix={<SearchOutlined style={{ color: "#999" }} />}
            size="large"
          />
          <Segmented
            value={filter}
            onChange={handleFilterChange}
            options={[
              { label: "全部", value: "all" },
              { label: "失物招领", value: "lost_found" },
              { label: "信息发布", value: "info" },
            ]}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <Spin size="large" />
          </div>
        ) : posts.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {posts.map((post) => {
              const cs = categoryStyles[post.category] || categoryStyles.info;
              return (
                <Link key={post.id} href={`/lost-found/${post.id}`}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 12,
                      border: "1px solid #f0f0f0",
                      height: "100%",
                      overflow: "hidden",
                      position: "relative",
                    }}
                    styles={{ body: { padding: 18 } }}
                  >
                    {/* Top accent bar */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: cs.gradient,
                      }}
                    />
                    <div style={{ marginBottom: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Tag
                        color={categoryColors[post.category]}
                        style={{ borderRadius: 4, margin: 0 }}
                      >
                        {categoryLabels[post.category]}
                      </Tag>
                      {post.status === "resolved" && (
                        <Tag color="success" style={{ borderRadius: 4, margin: 0 }}>
                          已解决
                        </Tag>
                      )}
                    </div>
                    <h4
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: 6,
                        color: "#1a1a2e",
                      }}
                    >
                      {post.title}
                    </h4>
                    <p
                      style={{
                        color: "#666",
                        fontSize: 13,
                        lineHeight: 1.6,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        margin: 0,
                        minHeight: 42,
                      }}
                    >
                      {post.content}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 12,
                        paddingTop: 10,
                        borderTop: "1px solid #f5f5f5",
                      }}
                    >
                      <span style={{ color: "#999", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                        <EnvironmentOutlined style={{ fontSize: 11 }} />
                        {post.author_name}
                      </span>
                      <span style={{ color: "#bbb", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                        <ClockCircleOutlined style={{ fontSize: 11 }} />
                        {dayjs(post.created_at).format("MM-DD HH:mm")}
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Empty description="暂无信息" style={{ padding: 60 }} />
        )}
      </Card>
    </div>
  );
}

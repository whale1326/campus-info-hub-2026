"use client";

import { useEffect, useState } from "react";
import { Card, Tag, Input, Empty, Spin, message, Button } from "antd";
import { SearchOutlined, PlusOutlined, EnvironmentOutlined, ClockCircleOutlined } from "@ant-design/icons";
import Link from "next/link";
import { postsApi, isLoggedIn, type Post } from "@/lib/api";
import dayjs from "dayjs";

export default function MarketPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  const fetchPosts = (kw?: string) => {
    setLoading(true);
    const params: any = { category: "market", page_size: 50 };
    if (kw) params.keyword = kw;
    postsApi
      .list(params)
      .then((data) => setPosts(data.posts))
      .catch(() => messageApi.error("加载失败"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = (value: string) => {
    setKeyword(value);
    fetchPosts(value);
  };

  return (
    <div className="fade-in-up">
      {contextHolder}
      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          🛒 二手交易市场
        </h2>
        <p style={{ color: "#999", margin: 0 }}>校园二手物品交易，安全便捷</p>
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
                  background: "var(--gradient-green)",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                }}
              >
                发布商品
              </Button>
            </Link>
          )
        }
        styles={{
          body: { padding: 20 },
        }}
      >
        <Input.Search
          placeholder="搜索商品名称或描述..."
          allowClear
          style={{ width: 320, marginBottom: 20, borderRadius: 10 }}
          onSearch={handleSearch}
          prefix={<SearchOutlined style={{ color: "#999" }} />}
          size="large"
        />

        {loading ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <Spin size="large" />
          </div>
        ) : posts.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {posts.map((post) => (
              <Link key={post.id} href={`/market/${post.id}`}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    border: "1px solid #f0f0f0",
                    overflow: "hidden",
                  }}
                  styles={{ body: { padding: 14 } }}
                  cover={
                    post.image_url ? (
                      <img
                        alt={post.title}
                        src={post.image_url}
                        style={{ height: 180, objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          height: 180,
                          background: "var(--gradient-green)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "rgba(255,255,255,0.6)",
                          fontSize: 48,
                        }}
                      >
                        <SearchOutlined />
                      </div>
                    )
                  }
                >
                  <h4
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: 8,
                      color: "#1a1a2e",
                    }}
                  >
                    {post.title}
                  </h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="price-tag" style={{ fontSize: 18 }}>
                      ¥{post.price.toFixed(2)}
                    </span>
                    {post.status === "resolved" && (
                      <Tag color="success" style={{ borderRadius: 4 }}>
                        已交易
                      </Tag>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: "1px solid #f5f5f5",
                    }}
                  >
                    <span style={{ color: "#999", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                      <EnvironmentOutlined style={{ fontSize: 11 }} />
                      {post.author_name}
                    </span>
                    <span style={{ color: "#bbb", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                      <ClockCircleOutlined style={{ fontSize: 11 }} />
                      {dayjs(post.created_at).format("MM-DD")}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Empty description="暂无商品" style={{ padding: 60 }} />
        )}
      </Card>
    </div>
  );
}

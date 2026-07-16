"use client";

import { useEffect, useState } from "react";
import { Card, List, Tag, Input, Empty, Spin, Segmented, message, Button } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
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
    <div>
      {contextHolder}
      <Card
        title="失物招领 & 信息发布"
        extra={
          isLoggedIn() && (
            <Link href="/post/create">
              <Button type="primary" icon={<PlusOutlined />}>发布信息</Button>
            </Link>
          )
        }
      >
        <div style={{ marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Input.Search
            placeholder="搜索标题或内容..."
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
            prefix={<SearchOutlined />}
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
          <div style={{ textAlign: "center", padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : posts.length > 0 ? (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3 }}
            dataSource={posts}
            renderItem={(post) => (
              <List.Item>
                <Link href={`/lost-found/${post.id}`}>
                  <Card hoverable size="small" style={{ height: "100%" }}>
                    <div style={{ marginBottom: 8 }}>
                      <Tag color={categoryColors[post.category]}>
                        {categoryLabels[post.category]}
                      </Tag>
                      {post.status === "resolved" && (
                        <Tag color="success">已解决</Tag>
                      )}
                    </div>
                    <h4 style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: 4,
                    }}>
                      {post.title}
                    </h4>
                    <p style={{
                      color: "#666",
                      fontSize: 13,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      {post.content}
                    </p>
                    <div style={{ color: "#999", fontSize: 12 }}>
                      {post.author_name} · {dayjs(post.created_at).format("MM-DD HH:mm")}
                    </div>
                  </Card>
                </Link>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无信息" />
        )}
      </Card>
    </div>
  );
}

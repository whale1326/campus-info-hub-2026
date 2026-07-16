"use client";

import { useEffect, useState } from "react";
import { Card, List, Tag, Input, Empty, Spin, message, Button } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
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
    <div>
      {contextHolder}
      <Card
        title="二手交易市场"
        extra={
          isLoggedIn() && (
            <Link href="/post/create">
              <Button type="primary" icon={<PlusOutlined />}>发布商品</Button>
            </Link>
          )
        }
      >
        <Input.Search
          placeholder="搜索商品名称或描述..."
          allowClear
          style={{ width: 300, marginBottom: 16 }}
          onSearch={handleSearch}
          prefix={<SearchOutlined />}
        />

        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : posts.length > 0 ? (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={posts}
            renderItem={(post) => (
              <List.Item>
                <Link href={`/market/${post.id}`}>
                  <Card
                    hoverable
                    size="small"
                    cover={
                      post.image_url ? (
                        <img
                          alt={post.title}
                          src={post.image_url}
                          style={{ height: 160, objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            height: 160,
                            background: "#f5f5f5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ccc",
                            fontSize: 40,
                          }}
                        >
                          <SearchOutlined />
                        </div>
                      )
                    }
                  >
                    <Card.Meta
                      title={
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {post.title}
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ color: "#f5222d", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                            ¥{post.price.toFixed(2)}
                          </div>
                          <div style={{ color: "#999", fontSize: 12 }}>
                            {post.author_name} · {dayjs(post.created_at).format("MM-DD")}
                          </div>
                          {post.status === "resolved" && <Tag color="success" style={{ marginTop: 4 }}>已交易</Tag>}
                        </div>
                      }
                    />
                  </Card>
                </Link>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无商品" />
        )}
      </Card>
    </div>
  );
}

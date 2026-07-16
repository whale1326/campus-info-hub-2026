"use client";

import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, List, Tag, Empty, Spin, message } from "antd";
import {
  SearchOutlined,
  ShopOutlined,
  NotificationOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { statsApi, type StatsResponse } from "@/lib/api";
import dayjs from "dayjs";

const categoryConfig: Record<string, { label: string; color: string; icon: React.ReactNode; href: string }> = {
  lost_found: { label: "失物招领", color: "blue", icon: <SearchOutlined />, href: "/lost-found" },
  market: { label: "二手交易", color: "green", icon: <ShopOutlined />, href: "/market" },
  info: { label: "信息发布", color: "orange", icon: <NotificationOutlined />, href: "/lost-found?category=info" },
};

export default function HomePage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi
      .get()
      .then((data) => setStats(data))
      .catch(() => message.error("加载统计数据失败"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <Card
        style={{
          marginBottom: 24,
          background: "linear-gradient(135deg, #1677ff 0%, #4096ff 100%)",
          border: "none",
          color: "#fff",
        }}
      >
        <h1 style={{ color: "#fff", fontSize: 28, marginBottom: 8 }}>
          欢迎来到校园信息平台
        </h1>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 16 }}>
          失物招领 / 二手交易 / 信息发布 — 一站式解决校园生活需求
        </p>
      </Card>

      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="活跃信息总数"
              value={stats?.total_posts || 0}
              prefix={<NotificationOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="失物招领"
              value={stats?.by_category?.lost_found || 0}
              prefix={<SearchOutlined />}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="二手交易"
              value={stats?.by_category?.market || 0}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Links */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {Object.entries(categoryConfig).map(([key, cfg]) => (
          <Col span={8} key={key}>
            <Link href={cfg.href}>
              <Card hoverable className="category-card">
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 36, color: cfg.color === "blue" ? "#1677ff" : cfg.color === "green" ? "#52c41a" : "#fa8c16" }}>
                    {cfg.icon}
                  </div>
                  <h3 style={{ marginTop: 12 }}>{cfg.label}</h3>
                  <p style={{ color: "#999" }}>
                    {stats?.by_category?.[key] || 0} 条信息
                  </p>
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      {/* Recent Posts */}
      <Card title="最新信息" extra={<Link href="/lost-found">查看全部 <ArrowRightOutlined /></Link>}>
        {stats?.recent_posts && stats.recent_posts.length > 0 ? (
          <List
            dataSource={stats.recent_posts}
            renderItem={(item) => {
              const cfg = categoryConfig[item.category] || categoryConfig.info;
              return (
                <List.Item>
                  <List.Item.Meta
                    avatar={<span style={{ fontSize: 24 }}>{cfg.icon}</span>}
                    title={
                      <Link href={`/${item.category === "market" ? "market" : "lost-found"}/${item.id}`}>
                        {item.title}
                      </Link>
                    }
                    description={
                      <span>
                        <Tag color={cfg.color}>{cfg.label}</Tag>
                        发布者: {item.author_name} · {dayjs(item.created_at).format("YYYY-MM-DD HH:mm")}
                      </span>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty description="暂无信息" />
        )}
      </Card>
    </div>
  );
}

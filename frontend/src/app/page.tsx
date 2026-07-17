"use client";

import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, List, Tag, Empty, Spin, message } from "antd";
import {
  SearchOutlined,
  ShopOutlined,
  NotificationOutlined,
  ArrowRightOutlined,
  FireOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { statsApi, type StatsResponse } from "@/lib/api";
import dayjs from "dayjs";

const categoryConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode; href: string; gradient: string }
> = {
  lost_found: {
    label: "失物招领",
    color: "blue",
    icon: <SearchOutlined />,
    href: "/lost-found",
    gradient: "var(--gradient-blue)",
  },
  market: {
    label: "二手交易",
    color: "green",
    icon: <ShopOutlined />,
    href: "/market",
    gradient: "var(--gradient-green)",
  },
  info: {
    label: "信息发布",
    color: "orange",
    icon: <NotificationOutlined />,
    href: "/lost-found?category=info",
    gradient: "var(--gradient-orange)",
  },
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
      <div style={{ textAlign: "center", padding: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <Card
        className="hero-section fade-in-up"
        style={{
          marginBottom: 24,
          background: "var(--gradient-primary)",
          border: "none",
          color: "#fff",
          borderRadius: 16,
          overflow: "hidden",
        }}
        styles={{ body: { padding: "40px 36px" } }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1
            style={{
              color: "#fff",
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 8,
              letterSpacing: 0.5,
            }}
          >
            欢迎来到校园信息平台
          </h1>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, margin: 0 }}>
            失物招领 / 二手交易 / 信息发布 — 一站式解决校园生活需求
          </p>
        </div>
      </Card>

      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8} className="fade-in-up stagger-1">
          <Card
            hoverable
            style={{ borderRadius: 12, border: "none", boxShadow: "var(--card-shadow)" }}
          >
            <Statistic
              title="活跃信息总数"
              value={stats?.total_posts || 0}
              prefix={<NotificationOutlined style={{ color: "#4f46e5" }} />}
              valueStyle={{ fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col span={8} className="fade-in-up stagger-2">
          <Card
            hoverable
            style={{ borderRadius: 12, border: "none", boxShadow: "var(--card-shadow)" }}
          >
            <Statistic
              title="失物招领"
              value={stats?.by_category?.lost_found || 0}
              prefix={<SearchOutlined style={{ color: "#6366f1" }} />}
              valueStyle={{ color: "#4f46e5", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col span={8} className="fade-in-up stagger-3">
          <Card
            hoverable
            style={{ borderRadius: 12, border: "none", boxShadow: "var(--card-shadow)" }}
          >
            <Statistic
              title="二手交易"
              value={stats?.by_category?.market || 0}
              prefix={<ShopOutlined style={{ color: "#10b981" }} />}
              valueStyle={{ color: "#10b981", fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Links */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {Object.entries(categoryConfig).map(([key, cfg], idx) => (
          <Col span={8} key={key} className={`fade-in-up stagger-${idx + 1}`}>
            <Link href={cfg.href}>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "var(--card-shadow)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: cfg.gradient,
                  }}
                />
                <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      margin: "0 auto 16px",
                      borderRadius: 16,
                      background: cfg.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      color: "#fff",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    {cfg.icon}
                  </div>
                  <h3 style={{ marginTop: 0, marginBottom: 4, fontSize: 17, fontWeight: 600 }}>
                    {cfg.label}
                  </h3>
                  <p style={{ color: "#999", margin: 0, fontSize: 14 }}>
                    <FireOutlined style={{ fontSize: 12, marginRight: 4 }} />
                    {stats?.by_category?.[key] || 0} 条信息
                  </p>
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      {/* Recent Posts */}
      <Card
        title={<span style={{ fontWeight: 600 }}>最新信息</span>}
        extra={
          <Link href="/lost-found">
            <span style={{ color: "#4f46e5", fontSize: 14 }}>
              查看全部 <ArrowRightOutlined />
            </span>
          </Link>
        }
        style={{ borderRadius: 12, border: "none", boxShadow: "var(--card-shadow)" }}
      >
        {stats?.recent_posts && stats.recent_posts.length > 0 ? (
          <List
            dataSource={stats.recent_posts}
            renderItem={(item) => {
              const cfg = categoryConfig[item.category] || categoryConfig.info;
              return (
                <List.Item style={{ padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: cfg.gradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: 18,
                        }}
                      >
                        {cfg.icon}
                      </div>
                    }
                    title={
                      <Link
                        href={`/${item.category === "market" ? "market" : "lost-found"}/${item.id}`}
                        style={{ fontWeight: 500, fontSize: 15 }}
                      >
                        {item.title}
                      </Link>
                    }
                    description={
                      <span style={{ fontSize: 13 }}>
                        <Tag
                          color={cfg.color}
                          style={{ borderRadius: 4, marginRight: 6 }}
                        >
                          {cfg.label}
                        </Tag>
                        发布者: {item.author_name} ·{" "}
                        {dayjs(item.created_at).format("YYYY-MM-DD HH:mm")}
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
